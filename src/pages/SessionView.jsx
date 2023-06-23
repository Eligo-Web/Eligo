// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { IconArrowUpRight, IconDownload, IconLock } from "@tabler/icons-react";
import axios from "axios";
import Papa from "papaparse";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { server } from "../ServerUrl";
import waitingSessionImg from "../assets/empty-session-state.png";
import AccessDenied from "../components/AccessDenied";
import {
  EmptySessionView,
  InstructorScreenAlert,
  LoadingSessionView,
} from "../components/BlankStates";
import { BackButton, FloatingButton, IconButton } from "../components/Buttons";
import * as clicker from "../components/ClickerBase";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import Overlay from "../components/Overlay";
import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import pause, {
  closePopup,
  decodeEmail,
  openPopup,
  reconnectBase,
  sessionValid,
} from "../components/Utils";
import {
  ClickerContext,
  GlobalPopupContext,
  NewPollContext,
} from "../containers/InAppContainer";

function SessionView() {
  const location = useLocation();
  const navigate = useNavigate();
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(null);
  const [base, setBase] = useContext(ClickerContext);
  const [globalPopup, setGlobalPopup] = useContext(GlobalPopupContext);
  const [pollWinInfo, setPollWinInfo] = useContext(NewPollContext);
  const [popup, setPopup] = useState(pollWinInfo);

  async function loadBase() {
    let newBase = await clicker.openDevice();
    if (newBase && !base) {
      setBase(await clicker.initialize(newBase));
    }
  }

  if (navigator.hid && base) {
    navigator.hid.ondisconnect = ({ device }) => {
      if (device.vendorId === 0x1881) {
        setBase(null);
      }
    };
  }

  window.onpagehide = function () {
    setPollWinInfo(null);
    if (popup) popup.close();
  };

  useEffect(() => {
    if (location.state && location.state.permission === "STUDENT") {
      checkActiveSession();
    }
    if (
      navigator.userAgent.indexOf("Safari") != -1 &&
      navigator.userAgent.indexOf("Chrome") == -1
    ) {
      if (document.querySelectorAll(".poll-card")) {
        document.querySelectorAll(".poll-card").forEach((card) => {
          card.style.backgroundColor = "#c8e2fb";
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!navigator.hid) return;
    reconnectBase(setBase);
  }, []);

  async function checkActiveSession() {
    await axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        if (!res.data.data.active) {
          navigateBack();
        }
      })
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
        navigateBack();
      });
  }

  async function closeSession() {
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/closeAll`
      )
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
      });
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/close`
      )
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
      });
    navigateBack();
  }

  function navigateBack() {
    setPollWinInfo(popup);
    navigate("/class", {
      state: location.state,
    });
  }

  function navigateOverview() {
    setPollWinInfo(popup);
    navigate("/overview", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        clickerId: location.state.clickerId,
      },
    });
  }

  function studentContent() {
    const [pollOpen, setPollOpen] = useState(false);
    const [pollId, setPollId] = useState(null);
    const [votePopup, setVotePopup] = useState(null);

    async function checkActivePoll() {
      await axios
        .get(
          `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/openPoll`
        )
        .then(async (res) => {
          if (res.data.data) {
            setPollId(res.data.data.activePollId);
            setPollOpen(true);
          } else {
            closePopup("Vote");
            await pause(250);
            setPollOpen(false);
          }
        })
        .catch((err) => {
          if (!sessionValid(err.response, setGlobalPopup)) return;
        });
    }

    useEffect(() => {
      checkActivePoll();
      if (!pollOpen) {
        const interval = setInterval(() => {
          checkActivePoll();
        }, 1000);
        return () => clearInterval(interval);
      }
    }, []);

    useEffect(() => {
      async function loadEmpty() {
        await pause(250);
        document.querySelector(".img-container").style.opacity = 1;
        document.getElementById("vote-container").style.opacity = 1;
      }

      if (pollOpen && pollId) {
        setVotePopup(
          <Overlay
            key="vote-popup"
            title="Vote"
            id="Vote"
            content={
              <Poll
                sectionId={location.state.sectionId}
                weekNum={location.state.weekNum}
                sessionId={location.state.sessionId}
                pollId={pollId}
                email={location.state.email}
              />
            }
            vote
          />
        );
      } else loadEmpty();
    }, [pollOpen]);

    useEffect(() => {
      async function openVote() {
        if (votePopup) {
          document.getElementById("vote-container").style.opacity = 1;
          await pause(250);
          openPopup("Vote");
        }
      }
      openVote();
    }, [votePopup]);

    return (
      <div>
        <title>{location.state.courseName} | Eligo</title>
        <BackButton label="Overview" onClick={() => navigateOverview()} />
        <div className="card-wrapper-student">
          <Menu hideJoin />
          <MenuBar title={location.state.sessionName} />
          {pollOpen && votePopup}
          <div className="img-container" style={{ padding: "3rem 0" }}>
            {/* illustration to be changed */}
            <div
              style={{ background: `url(${waitingSessionImg}) no-repeat` }}
              className="waiting-state-img"
            />
            <div className="vote-container-student" id="vote-container">
              <Button
                variant="blank-state"
                className="large-title"
                onClick={() => {
                  if (!pollOpen) window.location.reload();
                  else openPopup("Vote");
                }}
              >
                {pollOpen ? "Vote" : "Refresh"}
              </Button>
              <div className="blank-state-msg">
                {pollOpen
                  ? "There's a poll waiting - join below!"
                  : "Your instructor has no open polls right now."}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function instructorContent() {
    const [polls, setPolls] = useState(<LoadingSessionView />);
    const [hideLabels, setHideLabels] = useState(window.innerWidth < 900);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      async function loadContent() {
        const pollContainer = await populatePollCards();
        await pause(250);
        document.querySelector(".poll-container").style.opacity = 0;
        await pause(150);
        setPolls(pollContainer);
        document.querySelector(".poll-container").style.opacity = 1;
        setLoaded(true);
      }
      loadContent();
    }, [refresh]);

    useEffect(() => {
      if (globalPopup) {
        pause(5).then(() => {
          openPopup(globalPopup.key);
        });
      }
    }, [globalPopup]);

    async function downloadSessionData() {
      await axios
        .get(
          `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
        )
        .then((res) => {
          let emails = Object.keys(res.data.data.students);
          for (let i = 0; i < emails.length; i++) {
            emails[i] = decodeEmail(emails[i]);
          }
          let latitudes = Object.values(res.data.data.students).map(
            (student) => student.latitude
          );
          let longitudes = Object.values(res.data.data.students).map(
            (student) => student.longitude
          );
          let distances = Object.values(res.data.data.students).map(
            (student) => student.distance
          );
          const csv = Papa.unparse({
            fields: [
              "Course Name",
              "Session Name",
              "Session Passcode",
              "Session Date",
              "Number of Polls",
              "Number of Students",
              "Student Emails",
              "Latitude",
              "Longitude",
              "Distance to Instructor (meters)",
            ],
            data: [
              [
                location.state.courseName,
                res.data.data.name,
                res.data.data.passcode,
                res.data.data.date,
                res.data.data.numPolls,
                emails.length,
                emails[0],
                latitudes[0],
                longitudes[0],
                distances[0],
              ],
            ].concat(
              res.data.data.students.length < 2
                ? []
                : emails
                    .slice(1)
                    .map((email, index) => [
                      "",
                      "",
                      "",
                      "",
                      "",
                      "",
                      email,
                      latitudes[index + 1],
                      longitudes[index + 1],
                      distances[index + 1],
                    ])
            ),
          });
          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${res.data.data.name}.csv`);
          link.click();
        })
        .catch((err) => {
          if (!sessionValid(err.response, setGlobalPopup)) return;
        });
    }

    window.onresize = function () {
      setHideLabels(window.innerWidth < 900);
    };

    return (
      <div>
        <title>{location.state.sessionName} | Eligo</title>
        <InstructorScreenAlert />
        <BackButton
          label={location.state.courseName}
          onClick={() => navigateBack()}
        />
        {globalPopup}
        {location.state.sessionActive && loaded && (
          <FloatingButton base={base} onClick={() => loadBase()} />
        )}
        <div className="card-wrapper">
          <Menu hideCreate />
          <MenuBar
            title={location.state.sessionName}
            description={location.state.sessionPasscode}
            showDescription
            sessionView
            clickable
          />
          {!polls && <EmptySessionView open={location.state.sessionActive} />}
          <div className="poll-container">{polls}</div>
          <div className="courses-bottom-row bottom-0 gap-3">
            <div className="d-flex flex-row gap-3">
              {location.state.sessionActive && (
                <IconButton
                  label="Close Session"
                  hideLabel={hideLabels}
                  icon={<IconLock size="1.6em" />}
                  variant="outline"
                  style={{ maxWidth: "max-content" }}
                  onClick={() => closeSession()}
                  disabled={!!popup}
                />
              )}
              <IconButton
                label="Download Session Data"
                hideLabel={hideLabels}
                icon={<IconDownload size="1.6em" />}
                variant="outline"
                style={{ maxWidth: "max-content" }}
                onClick={() => downloadSessionData()}
              />
            </div>
            {location.state.sessionActive && (
              <IconButton
                label={popup ? "Return to Popup" : "Start Polls"}
                icon={
                  popup ? (
                    <IconArrowUpRight size="1.7em" />
                  ) : (
                    <IoMdAddCircleOutline size="1.7em" />
                  )
                }
                style={{ maxWidth: "max-content" }}
                onClick={() => openPolling()}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  async function populatePollCards() {
    const activeCards = [];
    const inactiveCards = [];
    let newPolls;

    await axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        newPolls = Object.entries(res.data.data.polls);
        newPolls = new Map([...newPolls.sort()]);
      })
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
      });

    if (!newPolls) return;

    for (let [pollId, poll] of newPolls) {
      if (poll.active && poll.endTimestamp < 0 && !popup) {
        await axios
          .put(
            `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/${pollId}/close`,
            {
              endTimestamp: Date.now(),
            }
          )
          .then((res) => (poll = res.data.data))
          .catch((err) => {
            if (!sessionValid(err.response, setGlobalPopup)) return;
          });
      }
      const newPopup = (
        <Overlay
          key={pollId}
          id={pollId}
          title="Poll Details"
          childContent={location.state}
          refresh={refresh}
          setRefresh={setRefresh}
          activePoll={poll.active}
          pollInfo={poll}
          email={location.state.email}
          poll
        />
      );

      if (poll.active) {
        activeCards.push(
          <PollCard
            title={poll.name}
            key={pollId}
            id={pollId}
            onClick={() => {
              if (popup) popup.focus();
            }}
          />
        );
      } else {
        inactiveCards.push(
          <PollCard
            title={poll.name}
            key={pollId}
            id={pollId}
            onClick={() => setGlobalPopup(newPopup)}
            inactive
          />
        );
      }
    }

    const cardContainer = [];
    if (activeCards.length) {
      cardContainer.push(
        <Container className="poll-card-container" key="active-polls">
          <h3 className="card-title divisor">Active Poll</h3>
          {activeCards}
        </Container>
      );
    }
    if (inactiveCards.length) {
      cardContainer.push(
        <Container className="poll-card-container" key="inactive-polls">
          <h3 className="card-title divisor">Inactive Polls</h3>
          {inactiveCards}
        </Container>
      );
    }
    if (!cardContainer.length) {
      return null;
    }
    return cardContainer;
  }

  async function openPolling() {
    if (popup) {
      popup.focus();
      return;
    }
    const newPopup = window.open(
      "/newpoll",
      "New Poll",
      "toolbar=no, location=no, statusbar=no, \
       menubar=no, scrollbars=0, width=250, \
       height=100, top=110, left=1040"
    );
    setPollWinInfo(newPopup);
    setPopup(newPopup);
    // communicate with window
    newPopup.props = {
      permission: location.state.permission,
      semester: location.state.semester,
      sectionId: location.state.sectionId,
      weekNum: location.state.weekNum,
      sessionId: location.state.sessionId,
      currPollId: "",
      prevResponse: "",
      prevClickerId: "",
      base: base,
    };
  }

  window.refreshPolls = () => setRefresh(!refresh);
  window.resetPopup = () => {
    setPollWinInfo(null);
    setPopup(null);
  };

  window.saveClosed = async (popup, pollId) => {
    if (base) {
      await clicker.stopPoll(base);
      await pause();
      await clicker.setScreen(base, 1, "Poll Ended");
      await pause();
      await clicker.setScreen(base, 2, new Date().toLocaleTimeString());
      await pause();
    }
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/${pollId}/close`,
        {
          endTimestamp: Date.now(),
        }
      )
      .catch((err) => {
        if (!sessionValid(err.response, setGlobalPopup)) return;
      });
    if (!popup.props || popup.props.sessionId === location.state.sessionId) {
      setRefresh(!refresh);
    }
    setPollWinInfo(null);
    setPopup(null);
  };

  return !authorized ? (
    <AccessDenied />
  ) : (
    <div>
      {location.state.permission === "STUDENT"
        ? studentContent()
        : instructorContent()}
    </div>
  );
}

export default SessionView;
