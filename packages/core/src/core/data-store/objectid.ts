let oidIndex = ~~(Math.random() * 0xffffff);
const MACHINE_ID = parseInt((Math.random() * 0xffffff).toString(), 10);

export default function genId(): string {
  const time = ~~(Date.now() / 1000);

  // Use pid
  const pid = Math.floor(Math.random() * 100000);
  oidIndex = (oidIndex + 1) % 0xffffff;
  const inc = oidIndex;

  // Buffer used
  const buffer = new Uint8Array(12);
  // Encode time
  buffer[3] = time & 0xff;
  buffer[2] = (time >> 8) & 0xff;
  buffer[1] = (time >> 16) & 0xff;
  buffer[0] = (time >> 24) & 0xff;
  // Encode machine
  buffer[6] = MACHINE_ID & 0xff;
  buffer[5] = (MACHINE_ID >> 8) & 0xff;
  buffer[4] = (MACHINE_ID >> 16) & 0xff;
  // Encode pid
  buffer[8] = pid & 0xff;
  buffer[7] = (pid >> 8) & 0xff;
  // Encode index
  buffer[11] = inc & 0xff;
  buffer[10] = (inc >> 8) & 0xff;
  buffer[9] = (inc >> 16) & 0xff;
  // Return the buffer
  return buffer.reduce((memo, i) => memo + `0${i.toString(16)}`.slice(-2), '');
}
