import axios from 'axios'
// use proper logging instead of console, and use axios error.

const resources = [{ url: 'https://api.blockcypher.com/v1/btc/main/addrs/{:address}' }, { url: 'https://xchain.io/api/address/{:address}' }, { url: 'https://xchain.io/api/balances/{:address}' }]

if (process.argv.length === 2) {
  console.error('Expected at least one adress as argument!')
  process.exit(1)
}

process.argv.slice(2).forEach(function (val, index, array) {
  Promise.all(resources.map((resource) => {
    return axios.get(resource.url.replace('{:address}', process.argv[2 + index]))
  })).then(function (responses) {
    responses.forEach((response, i) => {
      // a quick way to force behaviour for certain endpoints data shapes, when typescript could refer them as types here.
      if (i === 0) {
        console.log(`The address ${process.argv[2 + index]}, and holds a bitcoin balance of  ${response.data.final_balance} satoshis or ${response.data.final_balance / 100000000}, with ${response.data.unconfirmed_n_tx} unconfirmed transactions`)
      }

      if (i === 1) {
        if (response.data.assets.held !== 0) {
          console.log(`also holding  ${response.data.assets.held} Counterparty (XCP) Assets`)
        }
      }
      if (i === 2) {
        const HighValues = []
        if (response.data.data.length > 0) {
          response.data.data.forEach(asset => {
            if ((asset.estimated_value.usd / asset.quantity > 1000) && asset.quantity > 1) {
              HighValues.push((`${asset.asset}, $${(asset.estimated_value.usd / asset.quantity).toFixed(2)} each, ${asset.quantity} of. `))
            }
          })
          if (HighValues.length) {
            console.log(`${HighValues.length} High Value Items Found`)
            console.log(`${HighValues.join('\n')}`)
          }
        }
      }
    })
  }).catch((reason) => {
    console.log(`Error:${reason.code}`)
    console.log('you probably ran out of API requests on blockcypher, try again in a few mins')
  })
})
