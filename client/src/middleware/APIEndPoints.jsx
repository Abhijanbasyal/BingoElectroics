
const serverDomain = process.env.REACT_APP_SERVER_DOMAIN;

console.log(serverDomain);

const APIEndPoints = {
  signUp: {
    url: `${serverDomain}/auth/register`,
    method: 'post',
  },
  login: {
    url: `${serverDomain}/auth/login`,
    method: 'post',
  },
  logout: {
    url: `${serverDomain}/auth/logout`,
    method: 'post',
  },
   currentUser: {
    url: `${serverDomain}/auth/current-user`,
    method: 'get',
  },
   Add_category: {
    url: `${serverDomain}/categories`,
    method: 'post',
  },
};

export default APIEndPoints;