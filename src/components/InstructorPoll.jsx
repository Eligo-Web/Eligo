import {
  IconChartBar,
  IconChartBarOff,
  IconClockHour3,
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconPlayerStopFilled,
  IconUser,
} from "@tabler/icons-react";
import { Mutex } from "async-mutex";
import axios from "axios";
import { defaults } from "chart.js/auto";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { pause } from "../pages/CourseView.jsx";
import "../styles/newpoll.css";
import { IconButton, PrimaryButton } from "./Buttons.jsx";
import * as clicker from "./ClickerBase";
import InputField from "./InputField";
import { closePopup } from "./Overlay.jsx";

export default function InstructorPoll() {
  const [minimized, setMinimized] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [numResponses, setNumResponses] = useState(0);
  const [pollData, setPollData] = useState([0, 0, 0, 0, 0]);
  const [pollName, setPollName] = useState(
    window.props ? window.props.pollName : ""
  );
  const [chartRef, setChartRef] = useState({});
  const [stopTime, setStopTime] = useState(false);
  const [prevResponse, setPrevResponse] = useState("");
  const [prevClickerId, setPrevClickerId] = useState("");
  const [axiosMutex, setAxiosMutex] = useState(new Mutex());
  const [dataMutex, setDataMutex] = useState(new Mutex());
  const winWidth = window.outerWidth - window.innerWidth;
  const winHeight = window.outerHeight - window.innerHeight;
  const server = "http://localhost:3000";
  let fullHeight = winHeight;
  let fullWidth = winWidth;
  document.title = "New Poll" + (minimized ? " (mini)" : "");

  let data = {
    labels: ["A", "B", "C", "D", "E"],
    datasets: [
      {
        data: pollData,
        backgroundColor: [
          "#09507f",
          "#2b8a35",
          "#8c7300",
          "#271e60",
          "#8a0e03",
        ],
        borderWidth: 0,
        borderRadius: 7,
      },
    ],
  };
  const chart = PollChart(data, setChartRef);

  async function updateClickerResponses(data) {
    const responseArray = ["A", "B", "C", "D", "E"];
    let bytes = new Uint8Array(data.buffer);
    if (bytes[0] === 1) {
      bytes = bytes.slice(32);
    }
    let response = clicker.parseResponse(bytes[2]);
    let clickerId = clicker.parseClickerId(bytes.slice(3, 6));
    if (response === prevResponse && clickerId === prevClickerId) {
      response = clicker.parseResponse(bytes[34]);
      clickerId = clicker.parseClickerId(bytes.slice(35, 38));
    }
    if (responseArray.includes(response)) {
      setPrevResponse(response);
      setPrevClickerId(clickerId);
    }
  }

  useEffect(() => {
    let email = "";
    if (!window.props || !prevResponse || !prevClickerId) {
      return;
    }
    (async () => {
      await axiosMutex.acquire();
      await axios
        .get(
          `${server}/student/clicker/${window.props.semester}/${window.props.sectionId}/${prevClickerId}`
        )
        .then((res) => {
          if (res.data.data) {
            email = res.data.data.email;
          }
        });
      if (email) {
        await axios.patch(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}`,
          {
            email: email,
            timestamp: Date.now().toString(),
            response: prevResponse,
          }
        );
      } else {
        await axios.patch(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}/unknownClicker`,
          {
            clickerId: prevClickerId,
            timestamp: Date.now().toString(),
            response: prevResponse,
          }
        );
      }
      if (chartRef && chartRef.getContext("2d").chart) {
        chartRef.getContext("2d").chart.update();
      }
      axiosMutex.release();
    })();
  }, [prevResponse, prevClickerId]);

  if (window.props && window.props.base) {
    window.props.base.oninputreport = async ({ device, reportId, data }) => {
      await dataMutex.acquire();
      await updateClickerResponses(data);
      dataMutex.release();
    };
  }

  useEffect(() => {
    if (window.props) {
      const inputField = document.querySelector(".form-control");
      inputField.value = window.props.defaultName;
      setPollName(window.props.defaultName);
    }
  }, [window.props]);

  useEffect(() => {
    if (numResponses) {
      const icon = document.querySelector(".responses");
      icon.style.right = 0;
      icon.style.opacity = 1;
    }
  }, [numResponses]);

  useEffect(() => {
    if (!window.props) {
      return;
    }
    const interval = setInterval(async () => {
      let pollUpdate = [];
      let numUpdate = 0;
      await axios
        .get(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}`
        )
        .then((res) => {
          pollUpdate = Object.values(res.data.data.liveResults);
          numUpdate = res.data.data.numResponses;
          setNumResponses(res.data.data.numResponses);
          setPollData(pollUpdate);
        });
      chartRef.getContext("2d").chart.update();
      if (window.props && window.props.base) {
        const percentArray = pollUpdate.map((x) =>
          (((x || 0) / (numUpdate || 1)) * 100).toFixed(0)
        );
        let percentString = "";
        for (let i = 0; i < percentArray.length; i++) {
          if (percentArray[i] < 10) {
            percentString += "  " + percentArray[i];
          } else if (percentArray[i] < 100) {
            percentString += " " + percentArray[i];
          } else {
            percentString += percentArray[i];
          }
        }
        percentString += "%";
        clicker.setScreen(window.props.base, 2, percentString);
        await pause();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [window.props, chartRef]);

  function resizeToContent() {
    const content = document.querySelector(".newpoll-pop-up");
    fullWidth = winWidth + content.offsetWidth;
    fullHeight = winHeight + content.offsetHeight;
    window.resizeTo(fullWidth, fullHeight);
  }

  async function deactivatePoll(action) {
    if (!window.props) window.close();
    const base = window.props ? window.props.base : null;
    if (base && base.opened) {
      await clicker.stopPoll(base);
      await pause();
      await clicker.setScreen(base, 1, "Poll Ended");
      await pause();
      await clicker.setScreen(base, 2, new Date().toLocaleTimeString());
      await pause();
    }
    if (action === "save") {
      await axios.put(
        `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}/close`,
        {
          name: pollName,
        }
      );
    } else if (action === "discard") {
      await axios.delete(
        `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}`
      );
    }
  }

  window.onload = function () {
    if (window.parent["name"] === "New Poll") {
      resizeToContent();
    }
  };

  window.onresize = function () {
    // window.resizeTo(fullWidth, fullHeight);
  };

  useEffect(() => {
    if (document.querySelector(".newpoll-pop-up")) {
      resizeToContent();
    }
  }, [minimized, showChart]);

  useEffect(() => {
    if (stopTime) {
      deactivatePoll("save");
    }
  }, [stopTime]);

  return (
    <div className="newpoll-wrapper" id="New Poll">
      <div className="newpoll newpoll-pop-up">
        <div className="newpoll-pop-up-content">
          <div className="d-flex align-items-center gap-3">
            <div className="responses">
              <IconUser stroke="0.14rem" style={{ margin: "-0.3rem" }} />
              {numResponses}
            </div>
            <Stopwatch
              stopTime={stopTime}
              setStopTime={setStopTime}
              autostart
            />
            {showChart ? (
              <IconChartBarOff
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            ) : (
              <IconChartBar
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            )}
            {minimized ? (
              <IconMaximize
                className="minimize"
                size="2.8rem"
                onClick={() => setMinimized(!minimized)}
              />
            ) : (
              <IconMinimize
                className="minimize"
                size="2.8rem"
                onClick={() => {
                  setMinimized(!minimized);
                  setShowChart(false);
                }}
              />
            )}
          </div>
          <div
            className="input-group"
            style={{ display: minimized ? "none" : "flex" }}
          >
            <InputField
              label="Poll Name"
              input="ex: Question 1"
              onChange={(e) => {
                setPollName(e.target.value);
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              height: showChart ? "fit-content" : 0,
              marginTop: showChart ? 0 : "-1rem",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {chart}
          </div>
          <div
            className="button-row"
            style={{ display: minimized ? "none" : "flex" }}
          >
            <PrimaryButton
              variant="secondary"
              label="Discard"
              onClick={async () => {
                await deactivatePoll("discard");
                window.close();
              }}
            />
            <PrimaryButton
              variant="primary"
              label="Save"
              onClick={async () => {
                setStopTime(true);
                await deactivatePoll("save");
                window.close();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClosedPoll(props) {
  const server = "http://localhost:3000";
  const [pollInfo, setPollInfo] = useState(null);
  const [chartRef, setChartRef] = useState(null);
  const thisPollData = {
    labels: ["A", "B", "C", "D", "E"],
    datasets: [
      {
        data: null,
        backgroundColor: [
          "#09507f",
          "#2b8a35",
          "#8c7300",
          "#271e60",
          "#8a0e03",
        ],
        borderWidth: 0,
        borderRadius: 7,
      },
    ],
  };

  const chart = PollChart(thisPollData, setChartRef);

  async function getPollInfo() {
    await axios
      .get(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`
      )
      .then((res) => setPollInfo(res.data.data));
  }

  async function deletePoll() {
    await axios.delete(
      `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`
    );
    closePopup(props.pollId);
    if (props.setRefresh) {
      props.setRefresh(!props.refresh);
    }
  }

  useEffect(() => {
    getPollInfo();
  }, []);

  useEffect(() => {
    if (pollInfo) {
      const overlay = document.getElementById(props.pollId + "-popup");
      const icon = overlay.querySelector(".responses");
      icon.style.right = 0;
      icon.style.opacity = 1;
      if (chartRef) {
        thisPollData.datasets[0].data = Object.values(pollInfo.liveResults);
        chartRef.getContext("2d").chart.data = thisPollData;
        chartRef.getContext("2d").chart.options.animation = false;
        chartRef.getContext("2d").chart.update();
      }
    }
  }, [pollInfo, thisPollData]);

  async function downloadPollDataDetailed() {
    let emails = [];
    let timestamps = [];
    let responses = [];
    for (const email in pollInfo.responses) {
      for (const timestamp in pollInfo.responses[email].answers) {
        emails.push(email);
        timestamps.push(timestamp);
        responses.push(
          Object.values(pollInfo.responses[email].answers[timestamp])
        );
      }
    }

    const csv = Papa.unparse({
      fields: ["Email/Clicker ID", "Response", "Timestamp"],
      data: emails.map((email, index) => [
        email,
        responses[index],
        timestamps[index],
      ]),
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${pollInfo.name}.csv`);
    link.click();
  }

  async function downloadPollDataFinal() {
    const csv = Papa.unparse({
      fields: ["Email", "Final Response"],
      data: Object.keys(pollInfo.responses).map((email) => [
        email,
        Object.values(pollInfo.responses[email].finalAnswer),
      ]),
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${pollInfo.name}.csv`);
    link.click();
  }

  return (
    <div className="newpoll-pop-up-content">
      {pollInfo ? (
        <div
          className="pop-up-content align-items-center"
          id={`${props.pollId}-popup`}
          style={{ padding: "0 1rem" }}
        >
          <div
            className="d-grid align-items-center gap-3"
            style={{
              width: "100%",
              paddingBottom: "0.5rem",
            }}
          >
            <div className="input-group">
              <InputField label="Poll Name" value={pollInfo.name} disabled />
            </div>
            <div className="poll-info">
              <Stopwatch
                id={props.pollId}
                time={Math.floor(
                  (pollInfo.endTimestamp - pollInfo.startTimestamp) / 1000
                )}
              />
              <div className="responses closed">
                <IconUser stroke="0.14rem" style={{ margin: "-0.3rem" }} />
                {pollInfo.numResponses}
              </div>
              <div className="responses closed" style={{ marginLeft: "auto" }}>
                {new Date(pollInfo.startTimestamp).toLocaleString()}
              </div>
            </div>
          </div>
          <div
            style={{
              height: "fit-content",
              width: "100%",
            }}
          >
            {pollInfo.numResponses ? (
              chart
            ) : (
              <center className="card-subtitle large-title m-auto">
                No responses recorded
              </center>
            )}
          </div>
          <div className="button-row flex-row-reverse">
            <IconButton
              label="Final Votes"
              icon={<IconDownload size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
              onClick={() => downloadPollDataFinal()}
            />
            <IconButton
              label="Detailed"
              icon={<IconDownload size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
              onClick={() => downloadPollDataDetailed()}
            />
            <PrimaryButton
              variant="delete"
              label="Delete"
              onClick={() => deletePoll()}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stopwatch(props) {
  const [time, setTime] = useState(props.time || 0);
  const [running, setRunning] = useState(props.autostart);

  useEffect(() => {
    if (props.stopTime) {
      stopTime();
    }
  }, [props.stopTime]);

  useEffect(() => {
    if (!props.autostart) renderStop();
  }, []);

  function stopTime() {
    if (props.setStopTime) {
      props.setStopTime(true);
    }
    setRunning(false);
    renderStop();
  }

  function renderStop() {
    let overlay = document;
    if (props.id) overlay = document.getElementById(props.id + "-popup");
    const btn = overlay.querySelector(".stop-button");
    const watch = overlay.querySelector(".stopwatch");
    const timeText = overlay.querySelector(".min-sec");
    if (btn && watch && timeText) {
      btn.style.opacity = 0;
      btn.style.width = 0;
      btn.style.marginRight = 0;
      watch.style.gap = 0;
      watch.style.backgroundColor = "#c2d3f3";
      watch.style.color = "#1b2543";
      timeText.style.width = "fit-content";
    }
  }

  useEffect(() => {
    let interval;
    if (running) {
      if (time >= 3600) {
        setRunning(false);
      }
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="stopwatch">
      {props.autostart ? null : (
        <IconClockHour3 stroke="0.14rem" style={{ marginRight: "0.6rem" }} />
      )}
      <div className="min-sec">
        <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
        <span>{("0" + Math.floor(time % 60)).slice(-2)}</span>
      </div>
      <div className="stopwatch-buttons">
        <IconPlayerStopFilled
          className="stop-button"
          preserveAspectRatio="none"
          onClick={() => stopTime()}
        />
      </div>
    </div>
  );
}

function PollChart(data, setChartRef) {
  defaults.font.family = "Inter";
  defaults.font.size = 13;
  defaults.font.weight = 700;
  defaults.color = "#000f2abb";

  return (
    <Bar
      data={data}
      updateMode="active"
      ref={(ref) => {
        if (setChartRef) setChartRef(ref);
      }}
      options={{
        scale: {
          ticks: {
            precision: 0,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            border: {
              display: false,
            },
            grid: {
              color: "#6f8daf",
              lineWidth: 2,
            },
          },
          y: {
            border: {
              display: false,
            },
            grid: {
              color: "#6f8daf",
              lineWidth: 2,
            },
          },
        },
        layout: {
          padding: 10,
          height: 900,
        },
      }}
    />
  );
}
