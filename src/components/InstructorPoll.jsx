import {
  IconChartBar,
  IconChartBarOff,
  IconClockHour3,
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconUser,
} from "@tabler/icons-react";
import { Mutex } from "async-mutex";
import axios from "axios";
import { defaults } from "chart.js/auto";
import Papa from "papaparse";
import { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { server } from "../ServerUrl";
import { ClickerContext, EditPopupContext } from "../containers/InAppContainer";
import { pause } from "../pages/CourseView.jsx";
import "../styles/newpoll.css";
import { IconButton, PrimaryButton } from "./Buttons.jsx";
import * as clicker from "./ClickerBase";
import InputField from "./InputField";
import { closePopup } from "./Overlay.jsx";

export default function InstructorPoll() {
  const [base, setBase] = useContext(ClickerContext);
  const [minimized, setMinimized] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [numResponses, setNumResponses] = useState(0);
  const [pollData, setPollData] = useState([0, 0, 0, 0, 0]);
  const [pollName, setPollName] = useState(
    window.props ? window.props.pollName : ""
  );
  const [chartRef, setChartRef] = useState({});
  const [running, setRunning] = useState(false);
  const [justOpened, setJustOpened] = useState(true);
  const [currPollId, setCurrPollId] = useState(null);
  const [prevResponse, setPrevResponse] = useState("");
  const [prevClickerId, setPrevClickerId] = useState("");
  const [axiosMutex, setAxiosMutex] = useState(new Mutex());
  const [dataMutex, setDataMutex] = useState(new Mutex());
  const winWidth = window.outerWidth - window.innerWidth;
  const winHeight = window.outerHeight - window.innerHeight;
  let fullHeight = winHeight;
  let fullWidth = winWidth;
  document.title = "New Poll" + (minimized ? " (mini)" : "");
  console.log("reloaded");

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
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${currPollId}`,
          {
            email: email,
            timestamp: Date.now().toString(),
            response: prevResponse,
          }
        );
      } else {
        await axios.patch(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${currPollId}/unknownClicker`,
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
    if (numResponses) {
      const icon = document.querySelector(".responses");
      icon.style.right = 0;
      icon.style.opacity = 1;
    }
  }, [numResponses]);

  useEffect(() => {
    if (!window.props || !currPollId || !running) {
      return;
    }
    const interval = setInterval(async () => {
      let pollUpdate = [];
      let numUpdate = 0;
      await axios
        .get(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${currPollId}`
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
        if (running) {
          clicker.setScreen(window.props.base, 2, percentString);
          await pause();
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [window.props, chartRef, running]);

  function resizeToContent() {
    const content = document.querySelector(".newpoll-pop-up");
    fullWidth = winWidth + content.offsetWidth;
    fullHeight = winHeight + content.offsetHeight;
    window.resizeTo(fullWidth, fullHeight);
  }

  async function createPoll() {
    const newPollId = `poll-${Date.now()}`;
    console.log("poll", newPollId, "created");
    if (base) {
      await clicker.startPoll(base);
      await pause();
      await clicker.setScreen(base, 1, " A  B  C  D  E");
      await pause();
      await clicker.setScreen(base, 2, " 0  0  0  0  0%");
      await pause();
    }
    await axios
      .post(
        `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${newPollId}`
      ).then((res) => {
        setPollName(res.data.data.name);
      });
    setCurrPollId(newPollId);
    if (window.opener.refreshPolls) {
      window.opener.refreshPolls();
    }
  }

  async function closePoll() {
    console.log("poll", currPollId, "ended");
    if (base && base.opened) {
      await clicker.stopPoll(base);
      await pause();
      await clicker.setScreen(base, 1, "Poll Ended");
      await pause();
      await clicker.setScreen(base, 2, new Date().toLocaleTimeString());
      await pause();
    }
    await axios.put(
      `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${currPollId}/close`,
      {
        name: pollName,
      }
    ).then(() => {
      window.opener.refreshPolls();
      setCurrPollId(null);
    });
  }

  window.onload = function () {
    if (window.parent["name"] === "New Poll") {
      resizeToContent();
    }
  };

  window.onresize = function () {
    // window.resizeTo(fullWidth, fullHeight);
  };

  window.onpagehide = async function () {
    if (currPollId && running) {
      window.opener.saveClosed(window, currPollId);
    }
    window.opener.resetPopup();
    window.close();
  };

  useEffect(() => {
    if (document.querySelector(".newpoll-pop-up")) {
      resizeToContent();
    }
  }, [minimized, justOpened, showChart]);

  useEffect(() => {
    if (justOpened && !running) return;
    if (!running && currPollId) {
      closePoll();
    } else {
      setPollName(null);
      setJustOpened(false);
      createPoll();
    }
  }, [running]);

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
              running={running}
              setRunning={setRunning}
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
            style={{ display: minimized || justOpened ? "none" : "flex" }}
          >
            <InputField
              label="Poll Name"
              input="ex: Question 1"
              value={pollName}
              onChange={(e) => {
                setPollName(e.target.value);
              }}
              disabled={!running}
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
              variant="primary"
              label="Save & Close"
              onClick={async () => {
                if (currPollId) await closePoll();
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
  const [pollInfo, setPollInfo] = useState(null);
  const [chartRef, setChartRef] = useState(null);
  const [editPopup, setEditPopup] = useContext(EditPopupContext);
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
  getPollInfo();

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
    closePopup(props.pollId, setEditPopup);
    if (props.setRefresh) {
      props.setRefresh(!props.refresh);
    }
  }

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
    let clickerIds = [];
    let timestamps = [];
    let responses = [];
    for (const email in pollInfo.responses) {
      for (const timestamp in pollInfo.responses[email].answers) {
        if (email.includes("@")) {
          emails.push(email);
          clickerIds.push("N/A");
        } else {
          emails.push("N/A");
          clickerIds.push(email);
        }
        timestamps.push(timestamp);
        responses.push(
          Object.values(pollInfo.responses[email].answers[timestamp])
        );
      }
    }

    const csv = Papa.unparse({
      fields: ["Email", "Clicker ID", "Response", "Timestamp"],
      data: emails.map((email, index) => [
        email,
        clickerIds[index],
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
    let emails = [];
    let clickerIds = [];
    let finalAnswers = [];
    for (const email in pollInfo.responses) {
      if (email.includes("@")) {
        emails.push(email);
        clickerIds.push("N/A");
      } else {
        emails.push("N/A");
        clickerIds.push(email);
      }
      finalAnswers.push(pollInfo.responses[email].finalAnswer);
    }
    const csv = Papa.unparse({
      fields: ["Email", "ClickerId", "Final Response"],
      data: emails.map((email, index) => [
        email,
        clickerIds[index],
        finalAnswers[index],
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
                closed
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
      ) : (
        <center className="d-grid w-100 card-subtitle">
          Loading...
        </center>
      )}
    </div>
  );
}

function Stopwatch(props) {
  const [time, setTime] = useState(props.closed ? props.time : 0);

  function stopTime() {
    if (!props.running) return;
    props.setRunning(false);
    renderStop();
  }
  
  function startTime() {
    if (props.running) return;
    setTime(0);
    props.setRunning(true);
    renderStart();
  }

  function renderStart() {
    let overlay = document.getElementById(props.id + "-popup");
    if (!props.id || !overlay) overlay = document;
    const stopwatch = overlay.querySelector(".stopwatch");
    if (stopwatch) {
      stopwatch.style.color = "#650000";
      pause(100).then(() => {
        stopwatch.style.backgroundColor = "#fbb8abd7";
      })
    }
  }

  function renderStop() {
    let overlay = document.getElementById(props.id + "-popup");
    if (!props.id || !overlay) overlay = document;
    const stopwatch = overlay.querySelector(".stopwatch");
    if (stopwatch) {
      stopwatch.style.backgroundColor = "#c2d3f3";
      pause(100).then(() => {
        stopwatch.style.color = "#1b2543";
      })
    }
  }

  useEffect(() => {
    let interval;
    if (props.running) {
      if (time >= 3600) {
        props.setRunning(false);
      }
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!props.running) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [props.running]);

  return (
    <div className={`stopwatch${props.closed ? " stopped" : ""}`}>
      {props.closed ? (
        <IconClockHour3 stroke="0.14rem" style={{ marginRight: "0.6rem" }} />
      ) : null}
      <div className="min-sec">
        {isNaN(time) || time < 0 ? (
          "ERROR"
        ) : (
          <div>
            <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
            <span>{("0" + Math.floor(time % 60)).slice(-2)}</span>
          </div>
        )}
      </div>
      <div className="stopwatch-buttons" style={{display: props.closed ? "none" : "flex"}}>
        <IconPlayerStopFilled
          className="stop-button"
          preserveAspectRatio="none"
          onClick={() => stopTime()}
          style={{ display: props.running ? "block" : "none" }}
        />
        <IconPlayerPlayFilled
          className="start-button"
          preserveAspectRatio="none"
          onClick={() => startTime()}
          style={{ display: !props.running ? "block" : "none" }}
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
