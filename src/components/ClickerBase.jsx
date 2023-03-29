import { pause } from "../pages/CourseView.jsx";
export async function getDevice() {
  let device;
  try {
    const devices = await navigator.hid.requestDevice({
      filters: [
        {
          vendorId: 0x1881,
        },
      ],
    });
    device = devices[0];
  } catch (error) {
    console.log("An error occurred.");
  }
  return device || null;
}

export async function openDevice() {
  const device = await getDevice();
  if (device) {
    await device.open();
    console.log(device.productName);
  } else {
    console.log("No device found.");
  }
  return device;
}

export async function initialize(device) {
  const freqCommand = [
    new Uint8Array([0x01, 0x10, 0x21, 0x41]),
    new Uint8Array([0x01, 0x16]),
  ];
  const commandA = [
    new Uint8Array([0x01, 0x2a, 0x21, 0x41, 0x05]),
    new Uint8Array([0x01, 0x12]),
    new Uint8Array([0x01, 0x15]),
    new Uint8Array([0x01, 0x16]),
  ];
  const commandProtocol = new Uint8Array([0x01, 0x2d]);
  const commandB = [
    new Uint8Array([0x01, 0x29, 0xa1, 0x8f, 0x96, 0x8d, 0x99, 0x97, 0x8f]),
    new Uint8Array([0x01, 0x17, 0x04]),
    new Uint8Array([0x01, 0x17, 0x03]),
    new Uint8Array([0x01, 0x16]),
  ];

  try {
    await pause();
    await device.sendReport(0, freqCommand[0]);
    await pause();
    await device.sendReport(0, freqCommand[1]);
    await pause();

    await device.sendReport(0, commandA[0]);
    await device.sendReport(0, commandA[1]);
    await device.sendReport(0, commandA[2]);
    await device.sendReport(0, commandA[3]);

    await device.sendReport(0, commandProtocol);
    await pause();

    await device.sendReport(0, commandB[0]);
    await device.sendReport(0, commandB[1]);
    await device.sendReport(0, commandB[2]);
    await device.sendReport(0, commandB[3]);
  } catch (error) {
    console.log(error);
  }
  return device;
}

export async function startPoll(device) {
  const commandA = [
    new Uint8Array([0x01, 0x17, 0x03]),
    new Uint8Array([0x01, 0x17, 0x05]),
  ];
  const commandPollType = new Uint8Array([0x01, 0x19, 0x66, 0x0a, 0x01]);
  const commandB = new Uint8Array([0x01, 0x11]);

  device.oninputreport = (event) => {
    console.log(event);
  };

  try {
    await device.sendReport(0, commandA[0]);
    await device.sendReport(0, commandA[1]);

    await device.sendReport(0, commandPollType);
    await pause();

    await device.sendReport(0, commandB);
  } catch (error) {
    console.log(error);
  }
}

export async function stopPoll(device) {
  const commandStop = [
    new Uint8Array([0x01, 0x12]),
    new Uint8Array([0x01, 0x16]),
    new Uint8Array([0x01, 0x17, 0x01]),
    new Uint8Array([0x01, 0x17, 0x03]),
    new Uint8Array([0x01, 0x17, 0x04]),
  ];

  await device.sendReport(0, commandStop[0]);
  await device.sendReport(0, commandStop[1]);
  await device.sendReport(0, commandStop[2]);
  await device.sendReport(0, commandStop[3]);
  await device.sendReport(0, commandStop[4]);
}

export function parseClickerId(byteSeq) {
  byteSeq.push(byteSeq[0] ^ byteSeq[1] ^ byteSeq[2]);
  return byte_seq.map((b) => ("0" + b.toString(16)).slice(-2)).join("");
}

export function parseResponse(byte) {
  return String.fromCharCode(byte - 0x81 + 65);
}
