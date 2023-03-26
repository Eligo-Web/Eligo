export async function openDevice() {
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
  if (device) {
    console.log(device.productName);
  } else {
    console.log("No device found.");
  }
  await device.open();
  return device;
}

export async function initialize(device) {
  const freqCommand = [
    new Uint8Array([0x01, 0x2a, 0x10, 0x22, 0x42]),
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

  await device.sendReport(0, freqCommand[0]);
  await device.sendReport(0, freqCommand[1]);

  await device.sendReport(0, commandA[0]);
  await device.sendReport(0, commandA[1]);
  await device.sendReport(0, commandA[2]);
  await device.sendReport(0, commandA[3]);

  await device.sendReport(0, commandProtocol);

  await device.sendReport(0, commandB[0]);
  await device.sendReport(0, commandB[1]);
  await device.sendReport(0, commandB[2]);
  await device.sendReport(0, commandB[3]);
}

export async function startPoll(device) {
  const commandStart = [
    new Uint8Array([0x01, 0x17, 0x03]),
    new Uint8Array([0x01, 0x17, 0x05]),
    new Uint8Array([0x01, 0x19, 0x66, 0x0a, 0x01]),
    new Uint8Array([0x01, 0x11]),
  ];

  await device.sendReport(0, commandStart[0]);
  await device.sendReport(0, commandStart[1]);
  await device.sendReport(0, commandStart[2]);
  await device.sendReport(0, commandStart[3]);
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

export async function parseClicker(byteSeq) {
  byteSeq.push(byteSeq[0] ^ byteSeq[1] ^ byteSeq[2]);
  return byte_seq.map((b) => ("0" + b.toString(16)).slice(-2)).join("");
}

export async function parseResponse(byte) {
  return String.fromCharCode(byte - 0x81 + 65);
}
