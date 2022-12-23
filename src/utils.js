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
