/* eslint-disable @typescript-eslint/require-await */

async function main(event) {
  console.log('event is 👉', JSON.stringify(event, null, 4));
  return {
    body: JSON.stringify({message: 'Success! 🎉🎉🎉'}),
    statusCode: 200,
  };
}

module.exports = {main};
