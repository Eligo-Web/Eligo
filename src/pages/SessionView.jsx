import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import { useNavigate, useLocation } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import Menu from "../components/Menu";
import Overlay, { closePopup, openPopup } from "../components/Overlay";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { BackButton, IconButton } from "../components/Buttons";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useState } from "react";
import AccessDenied from "../components/AccessDenied";
import { useEffect } from "react";
import axios from "axios";
import { BlankSessionView } from "../components/BlankStates";
import { IconDownload, IconLock } from "@tabler/icons-react";
import Papa from "papaparse";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const server = "http://localhost:3000";
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(null);

  function pause() {
    return new Promise((res) => setTimeout(res, 250));
  }

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

  async function checkActiveSession() {
    const server = "http://localhost:3000";
    console.log(location.state);
    await axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        if (!res.data.data.active) {
          navigateBack();
        }
      })
      .catch((err) => console.log(err));
  }

  async function closeSession() {
    const server = "http://localhost:3000";
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/closeAll`
      )
      .then((res) => {})
      .catch((err) => console.log(err));
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/close`
      )
      .then((res) => {})
      .catch((err) => console.log(err));
    navigateBack();
  }

  function navigateBack() {
    console.log(location.state);
    navigate("/class", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
        courseName: location.state.courseName,
        sectionId: location.state.sectionId,
        passcode: location.state.classPasscode,
      },
    });
  }

  function navigateOverview() {
    navigate("/overview", {
      state: {
        name: location.state.name,
        permission: location.state.permission,
        email: location.state.email,
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
            await pause();
            setPollOpen(false);
          }
        })
        .catch((err) => console.log(err));
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
      if (pollOpen && pollId) {
        setVotePopup(
          <Overlay
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
            key="vote-popup"
            vote
          />
        );
      } else loadEmpty();
      async function loadEmpty() {
        await pause();
        document.getElementById("vote-container").style.opacity = 100;
      }
    }, [pollOpen]);

    useEffect(() => {
      async function openVote() {
        if (votePopup) {
          document.getElementById("vote-container").style.opacity = 100;
          await pause();
          openPopup("Vote");
        }
      }
      openVote();
    }, [votePopup]);

    return (
      <div>
        <BackButton label="Overview" onClick={() => navigateOverview()} />
        <div className="card-wrapper">
          <Menu />
          <MenuBar
            title={location.state.sessionName}
            description={location.state.passcode}
            clickable
          />
          {pollOpen ? votePopup : null}
          <div className="vote-container" id="vote-container">
            <div className="blank-state-msg">
              {pollOpen
                ? "There's a poll waiting - join below!"
                : "Your instructor has no open polls right now."}
            </div>
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
          </div>
        </div>
      </div>
    );
  }

  function instructorContent() {
    const [polls, setPolls] = useState(<BlankSessionView />);
    const [buttonLabels, setLabels] = useState(window.innerWidth > 900);

    window.onresize = function () {
      if (window.innerWidth < 900) {
        setLabels(false);
      } else if (!buttonLabels) {
        setLabels(true);
      }
    };

    useEffect(() => {
      async function loadContent() {
        const pollContainer = await populatePollCards();
        await pause();
        document.querySelector(".poll-container").style.opacity = 0;
        await pause();
        setPolls(pollContainer);
        document.querySelector(".poll-container").style.opacity = 100;
      }
      loadContent();
    }, [refresh]);

    async function downloadSessionData() {
      await axios
        .get(
          `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/`
        )
        .then((res) => {
          const csv = Papa.unparse({
            fields: [
              "Course Name",
              "Session Name",
              "Session Passcode",
              "Session Date",
              "Number of Polls",
              "Number of Students",
              "Student Emails",
            ],
            data: [
              [
                location.state.courseName,
                res.data.data.name,
                res.data.data.passcode,
                res.data.data.date,
                res.data.data.numPolls,
                res.data.data.students.length,
                res.data.data.students,
              ],
            ],
          });
          console.log(csv);
          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", "polls.csv");
          link.click();
        })
        .catch((err) => console.log(err));
    }

    return (
      <div>
        <BackButton
          label={location.state.courseName}
          onClick={() => navigateBack()}
        />
        <div
          className="card-wrapper"
          style={{
            height: location.state.sessionActive ? "" : "calc(100vh - 9rem)",
          }}
        >
          <Menu hideCreate />
          <MenuBar
            title={location.state.sessionName}
            description={location.state.passcode}
            clickable
            showDescription
          />
          <div className="poll-container">{polls}</div>
          <div className="courses-bottom-row bottom-0 gap-3">
            {location.state.sessionActive ? (
              <IconButton
                label="Create Poll"
                icon={<IoMdAddCircleOutline size="1.7em" />}
                style={{ maxWidth: "max-content" }}
                onClick={() => createPoll()}
              />
            ) : null}
            <div className="row gap-3 p-3">
              {location.state.sessionActive ? (
                <IconButton
                  label={buttonLabels ? "Close Session" : null}
                  icon={<IconLock size="1.6em" />}
                  variant="outline"
                  style={{ maxWidth: "max-content" }}
                  onClick={() => closeSession()}
                />
              ) : null}
              <IconButton
                label={
                  buttonLabels || !location.state.sessionActive
                    ? "Download Session Data"
                    : null
                }
                icon={<IconDownload size="1.6em" />}
                variant="outline"
                style={{ maxWidth: "max-content" }}
                onClick={() => downloadSessionData()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function populatePollCards() {
    const activeCards = [];
    const inactiveCards = [];
    let polls;

    await axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        if (res.data.status === 200) {
          polls = Object.entries(res.data.data.polls);
          polls = new Map([...polls.sort()]);
        }
      })
      .catch((err) => console.log(err));

    for (let [pollId, poll] of polls) {
      if (poll.active) {
        activeCards.push(<PollCard title={poll.name} key={pollId} />);
      } else {
        inactiveCards.push(
          <PollCard title={poll.name} key={pollId} inactive />
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

    return cardContainer;
  }

  async function createPoll() {
    const server = "http://localhost:3000";
    const newPollId = `poll-${Date.now()}`;
    await axios
      .post(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/${newPollId}`
      )
      .then((res) => {})
      .catch((err) => console.log(err));
    setRefresh({ created: true });
    const popup = window.open(
      "/newpoll",
      "New Poll",
      "toolbar=no, location=no, statusbar=no, \
       menubar=no, scrollbars=0, width=250, \
       height=100, top=110, left=1040"
    );
    // communicate with window
    popup.props = {
      sectionId: location.state.sectionId,
      weekNum: location.state.weekNum,
      sessionId: location.state.sessionId,
      pollId: newPollId,
    };
    while (!popup.closed) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await axios
      .put(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/${newPollId}/close`
      )
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setRefresh({ closed: true });
  }

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
