import React, { useEffect, useState } from "react";
import { PrimaryButton } from "./Buttons.jsx";
import {
  IconChartBar,
  IconChartBarOff,
  IconMaximize,
  IconMinimize,
  IconPlayerStopFilled,
} from "@tabler/icons-react";
import InputField from "./InputField";
import Chart, { defaults, Legend, plugins } from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "../styles/newpoll.css";

export default function InstructorPoll() {
  const [minimized, setMinimized] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const winWidth = window.outerWidth - window.innerWidth;
  const winHeight = window.outerHeight - window.innerHeight;
  let fullHeight = winHeight;
  let fullWidth = winWidth;
  document.title = "New Poll" + (minimized ? " (mini)" : "");

  function resizeToContent() {
    const content = document.querySelector(".newpoll-pop-up");
    fullWidth = winWidth + content.offsetWidth;
    fullHeight = winHeight + content.offsetHeight;
    window.resizeTo(fullWidth, fullHeight);
  }

  window.onload = function () {
    if (window.parent["name"] === "New Poll") {
      resizeToContent();
    }
  };

  window.onresize = function () {
    window.resizeTo(fullWidth, fullHeight);
  };

  useEffect(() => {
    // Toggle minimize popup
    if (document.querySelector(".newpoll-pop-up")) {
      resizeToContent();
    }
  }, [minimized, showChart]);

  return (
    <div className="newpoll-wrapper" id="New Poll">
      <div className="newpoll newpoll-pop-up">
        <div className="newpoll-pop-up-content">
          <div className="d-flex align-items-center gap-3">
            <Stopwatch />
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
            <InputField label="Poll Name" input="ex: Question 1" />
          </div>
          <div
            className="button-row"
            style={{ display: minimized ? "none" : "flex" }}
          >
            <PrimaryButton
              variant="secondary"
              label="Discard"
              onClick={() => {
                console.log("discarded poll");
                window.close();
              }}
            />
            <PrimaryButton
              variant="primary"
              label="Save"
              onClick={() => {
                console.log("saved poll");
                window.close();
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              height: showChart ? "fit-content" : 0,
              display: showChart ? "block" : "none",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {PollChart()}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);

  function stopTime() {
    setRunning(false);
    const btn = document.querySelector(".stop-button");
    const watch = document.querySelector(".stopwatch");
    const timeText = document.querySelector(".min-sec");
    btn.style.opacity = 0;
    btn.style.width = 0;
    btn.style.marginRight = 0;
    watch.style.gap = 0;
    watch.style.backgroundColor = "#c2d3f3";
    watch.style.color = "#1b2543";
    console.log(time);
    timeText.style.width = "fit-content";
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

function PollChart(props) {
  defaults.font.family = "Inter";
  defaults.font.size = 15;
  defaults.font.weight = 700;
  defaults.color = "#00060dbb";

  const data = {
    labels: ["A", "B", "C", "D", "E"],
    datasets: [
      {
        data: [2, 0, 40, 10, 6],
        backgroundColor: [
          "#135670",
          "#0b9a47",
          "#9c8305",
          "#221b6e",
          "#9a1e0b",
        ],
        borderWidth: 0,
        borderRadius: 5,
      },
    ],
  };
  return (
    <Bar
      data={data}
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
        }
      }}
    />
  );
}
