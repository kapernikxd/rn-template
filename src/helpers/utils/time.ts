export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const toTwoDigits = (value: number) => value.toString().padStart(2, '0');

  if (hours > 0) {
    return `${toTwoDigits(hours)}:${toTwoDigits(minutes)}:${toTwoDigits(seconds)}`;
  }

  return `${toTwoDigits(minutes)}:${toTwoDigits(seconds)}`;
};

export default formatDuration;
