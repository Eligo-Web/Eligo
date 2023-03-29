import * as Tabler from "@tabler/icons-react";
import axios from "axios";
import { defaults } from "chart.js/auto";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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
  const [pollName, setPollName] = useState("");
  const [chartRef, setChartRef] = useState({});
  const [stopTime, setStopTime] = useState(false);
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

  useEffect(() => {
    if (window.props && window.props.base) {
      window.props.base.oninputreport = async ({ device, reportId, data }) => {
        const bytes = new Uint8Array(data.buffer);
        console.log(bytes);
        const response = await clicker.parseResponse(bytes[2]);
        console.log(response);
        setPollData((prev) => {
          let newData = [...prev];
          newData[response.charCodeAt(0) - 65]++;
          console.log(newData);
          return newData;
        });
        if (chartRef && chartRef.getContext("2d").chart) {
          chartRef.getContext("2d").chart.update();
          console.log("updated");
        }
      };
    }
  }, [window.props, chartRef]);

  useEffect(() => {
    if (numResponses) {
      const icon = document.querySelector(".responses");
      icon.style.right = 0;
      icon.style.opacity = 1;
    }
  }, [numResponses]);

  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     let pollUpdate = [];
  //     await axios
  //       .get(
  //         `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}`
  //       )
  //       .then((res) => {
  //         pollUpdate = Object.values(res.data.data.liveResults);
  //         setNumResponses(res.data.data.numResponses);
  //         setPollData(pollUpdate);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //     chartRef.getContext("2d").chart.update();
  //   }, 50);
  //   return () => clearInterval(interval);
  // }, [chartRef]);

  function resizeToContent() {
    const content = document.querySelector(".newpoll-pop-up");
    fullWidth = winWidth + content.offsetWidth;
    fullHeight = winHeight + content.offsetHeight;
    window.resizeTo(fullWidth, fullHeight);
  }

  async function deactivatePoll(action) {
    const base = window.props ? window.props.base : null;
    if (base) base.oninputreport = null;
    if (base && base.opened) await clicker.stopPoll(base);
    if (action === "save") {
      await axios
        .put(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}/close`,
          {
            name: pollName,
          }
        )
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (action === "discard") {
      await axios
        .delete(
          `${server}/course/${window.props.sectionId}/${window.props.weekNum}/${window.props.sessionId}/${window.props.pollId}`
        )
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
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
              <Tabler.IconUser stroke="0.14rem" style={{ margin: "-0.3rem" }} />
              {numResponses}
            </div>
            <Stopwatch
              stopTime={stopTime}
              setStopTime={setStopTime}
              autostart
            />
            {showChart ? (
              <Tabler.IconChartBarOff
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            ) : (
              <Tabler.IconChartBar
                className="data-chart"
                size="2.8rem"
                onClick={() => setShowChart(!showChart)}
              />
            )}
            {minimized ? (
              <Tabler.IconMaximize
                className="minimize"
                size="2.8rem"
                onClick={() => setMinimized(!minimized)}
              />
            ) : (
              <Tabler.IconMinimize
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
        `${server}/course//${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`
      )
      .then((res) => setPollInfo(res.data.data))
      .catch((err) => console.log(err));
  }

  async function deletePoll() {
    await axios
      .delete(
        `${server}/course/${props.sectionId}/${props.weekNum}/${props.sessionId}/${props.pollId}`
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
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
      fields: ["Email", "Response", "Timestamp"],
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
                <Tabler.IconUser
                  stroke="0.14rem"
                  style={{ margin: "-0.3rem" }}
                />
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
              icon={<Tabler.IconDownload size="1.6em" />}
              variant="outline"
              style={{ maxWidth: "max-content" }}
              onClick={() => downloadPollDataFinal()}
            />
            <IconButton
              label="Detailed"
              icon={<Tabler.IconDownload size="1.6em" />}
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
        <Tabler.IconClockHour3
          stroke="0.14rem"
          style={{ marginRight: "0.6rem" }}
        />
      )}
      <div className="min-sec">
        <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
        <span>{("0" + Math.floor(time % 60)).slice(-2)}</span>
      </div>
      <div className="stopwatch-buttons">
        <Tabler.IconPlayerStopFilled
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
        },
      }}
    />
  );
}
