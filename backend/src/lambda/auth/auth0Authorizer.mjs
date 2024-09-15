import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')
const secret = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJX7sj9wueMHbzMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi0wNWhxcG40c3Byd2c4MXZzLnVzLmF1dGgwLmNvbTAeFw0yNDA5MTQw
NDE2MjhaFw0zODA1MjQwNDE2MjhaMCwxKjAoBgNVBAMTIWRldi0wNWhxcG40c3By
d2c4MXZzLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOTGdjUGvzReR0pjJNPq449bRJYBOu9LZ2ekTyapgPEcTW6YG8SnQZ5cFRIj
QtEKvM0sxmN+iEX9hqIRnxV/BYIEyUtch6EkKIzIMudWNrzdAF+E8Zgp1lKm6/yO
ug8NPq73wMfp0vYxXrMTR8j4D4jCAGaZc2m+qjQ8Pnh1qm/Dy4yEFg5JiYJRUy4r
EjmA1nK55stnj+2CdSum2eBX4yOboEOZJ1lxTKi1TdieM0b22qSrpnhsIuEBecVg
ZJYrRaVUvLRamgWWg1M78L41y0S4dhTXTjo2P0PfXu3gTkxwuO06/+ZBVCz/t11h
C44+FHFEiBN7FpAddPMFrnp9j/UCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUpmDc7U4jAknBIQcjNoJ67BzsQSgwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBISArPIRAm3fC+T585PiAxsr8RN1lRtLq2so81BsrR
VZdxAoCSKdzXSytkvRObA4VURW7Tf27UwymbRfKLPpziD0G245FjphKJLP0szJEp
74fVI6fvUhglIl/VJmrjiOrhVNc41sR8QiI1Xzo15vF+s2lzyACFr+GaE2kubqRL
FIhpQI1IBVzK8fAtonWxaBMBSMVuv8KwG0lVbv/Jk40S+4O5VCv//egiHtZCRRsp
B06YVv9q8xSa2O2yPE9+2Pwv2M8xC1B5arouOAFNh0CG+UO9em0vlK/bWcn6GEi3
4Yoru3MPyBUvVigIGiHlv7MtX6UaqZR/pI1ZFqWSwXkH
-----END CERTIFICATE-----`
const jwksUrl =
  'https://dev-05hqpn4sprwg81vs.us.auth0.com/.well-known/jwks.json'

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })
  const response = await Axios(jwksUrl)
  const signiKey = response.data.keys.find((key) => key.kid === jwt.header.kid)
  if (!signiKey) {
    throw new Error('Invalid Signkey')
  }
  const verifyToken = jsonwebtoken.verify(token, secret, { algorithms: ['RS256'] })
  return verifyToken
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
