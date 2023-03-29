import Transaction from 'arweave/node/lib/transaction';

export function interactionTagsParser(tx) {
  const contractTx = new Transaction(tx);
  let tags = [];
  contractTx.get('tags').forEach((tag) => {
    let key = tag.get('name', { decode: true, string: true });
    let value = tag.get('value', { decode: true, string: true });
    tags.push({ key, value });
  });
  return tags;
}

export function downloadFile(content, name, type) {
  let a = document.createElement('a');
  let file = new Blob([JSON.stringify(content, null, 2)], { type: type });
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
}

export function convertTime(date, sortKeyTimestamp, timezoneType = 'Europe/Berlin') {
  let fullDate;
  const epochs = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];
  const convertTZ = (date, tzString) => {
    return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
  };
  const getDuration = (timeAgoInSeconds) => {
    for (let [name, seconds] of epochs) {
      const interval = Math.floor(timeAgoInSeconds / seconds);
      if (interval >= 1) {
        return {
          interval: interval,
          epoch: name,
        };
      }
    }
  };
  const timeAgo = (date, sortKeyTimestamp) => {
    const timeAgoInSeconds = Math.floor(
      (convertTZ(new Date(), timezoneType) -
        convertTZ(
          new Date(sortKeyTimestamp ? sortKeyTimestamp : date),
          sortKeyTimestamp ? 'Europe/Berlin' : 'Europe/London'
        )) /
        1000
    );
    const { interval, epoch } = getDuration(timeAgoInSeconds);
    const suffix = interval === 1 ? '' : 's';
    fullDate = `${interval} ${epoch}${suffix} ago`;
  };
  timeAgo(date, sortKeyTimestamp);
  return fullDate;
}

export function formatIdPattern(id) {
  const newString = id.slice(0, 3) + '...' + id.slice(-3);
  return newString;
}
