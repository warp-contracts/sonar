import Transaction from 'arweave/node/lib/transaction';


export function interactionTagsParser(tx) {
    const contractTx = new Transaction(tx.contractTx);
    let tags = [];
    contractTx.get('tags').forEach((tag) => {
      let key = tag.get('name', { decode: true, string: true });
      let value = tag.get('value', { decode: true, string: true });
      tags.push({ key, value });
    });
    return tags;
}

