import { IconDownload, IconLock } from "@tabler/icons-react";
import axios from "axios";
import Papa from "papaparse";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import AccessDenied from "../components/AccessDenied";
import { BlankSessionView, EmptySessionView } from "../components/BlankStates";
import { BackButton, IconButton } from "../components/Buttons";
import Menu from "../components/Menu";
import MenuBar from "../components/MenuBar";
import Overlay, { closePopup, openPopup } from "../components/Overlay";
import PollCard from "../components/PollCard";
import { Poll } from "../components/Popups";
import { ClickerContext } from "../containers/InAppContainer";
import { pause } from "./CourseView";

function SessionView(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const server = "http://localhost:3000";
  const authorized = location.state && location.state.permission;
  const [refresh, setRefresh] = useState(null);
  const [popup, setPopup] = useState(null);
  const [base, setBase] = useContext(ClickerContext);

  useEffect(() => {
    if (base) console.log(base);
  });

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
        clickerId: location.state.clickerId,
      },
    });
  }

  function navigateOverview() {
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
        document.getElementById("vote-container").style.opacity = 1;
      }
    }, [pollOpen]);

    useEffect(() => {
      async function openVote() {
        if (votePopup) {
          document.getElementById("vote-container").style.opacity = 1;
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
          <Menu hideJoin />
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
    const [overlays, setOverlays] = useState(null);
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
        const [pollContainer, pollOverlays] = await populatePollCards();
        await pause();
        document.querySelector(".poll-container").style.opacity = 0;
        await pause(0.4);
        setPolls(pollContainer);
        document.querySelector(".poll-container").style.opacity = 1;
        setOverlays(pollOverlays);
      }
      loadContent();
    }, [refresh]);

    async function downloadSessionData() {
      await axios
        .get(
          `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/`
        )
        .then((res) => {
          let emails = [];
          res.data.data.students.forEach((student) => {
            emails.push(student);
          });
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
                emails[0],
              ],
            ].concat(
              res.data.data.students.length < 2
                ? []
                : emails.slice(1).map((email) => {
                    return ["", "", "", "", "", "", email];
                  })
            ),
          });
          const blob = new Blob([csv], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${res.data.data.name}.csv`);
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
          {overlays}
          {polls ? null : <EmptySessionView />}
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
    const overlays = [];
    let newPolls;

    await axios
      .get(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}`
      )
      .then((res) => {
        if (res.data.status === 200) {
          newPolls = Object.entries(res.data.data.polls);
          newPolls = new Map([...newPolls.sort()]);
        }
      })
      .catch((err) => console.log(err));

    for (let [pollId, poll] of newPolls) {
      if (poll.active) {
        activeCards.push(<PollCard title={poll.name} key={pollId} />);
      } else {
        inactiveCards.push(
          <PollCard title={poll.name} key={pollId} id={pollId} inactive />
        );
        overlays.push(
          <Overlay
            key={pollId}
            id={pollId}
            title="Poll Details"
            pollId={pollId}
            childContent={location.state}
            refresh={refresh}
            setRefresh={setRefresh}
            closedPoll
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
    if (!cardContainer.length) return [null, null];
    return [cardContainer, overlays];
  }

  async function createPoll() {
    const server = "http://localhost:3000";
    const newPollId = `poll-${Date.now()}`;
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
    await axios
      .post(
        `${server}/course/${location.state.sectionId}/${location.state.weekNum}/${location.state.sessionId}/${newPollId}`
      )
      .then((res) => {})
      .catch((err) => console.log(err));
    setPopup(newPopup);
    setRefresh({ created: true });
    // communicate with window
    newPopup.props = {
      sectionId: location.state.sectionId,
      weekNum: location.state.weekNum,
      sessionId: location.state.sessionId,
      pollId: newPollId,
    };
    while (!newPopup.closed) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setPopup(null);
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
