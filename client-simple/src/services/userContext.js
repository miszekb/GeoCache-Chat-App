import * as React from "react";
import { accountsGraphQLTransport, accountsPassword } from "./apollo";
import gql from "graphql-tag";
import { withApollo } from "react-apollo";

const initialState = { user: undefined, loggingIn: true };

export const UserContext = React.createContext({
  userState: initialState,
  setUserState: () => {},
  getUser: () => {},
  signUp: () => {},
  logIn: () => {},
  logOut: () => {},
  getAllUsers: () => {}
});

const GET_USER = gql`
query getUser {
  getUser {
  id
  emails {
    address
    verified
    __typename
  }
  profile {
    firstName
    lastName
    profilePicture
  }
  username 
  __typename
  isCompany
  cachesFound
  }
}`;

const GET_USERS = gql`
  query users{
    users {
      profile {
        firstName
        lastName
        profilePicture
      }
      cachesFound
    }
  }
`;

const _UserProvider = props => {
  const [userState, setUserState] = React.useState(initialState);

  const getUser = async () => {
    let user = null;
    try {
      const {data: {getUser}} = await props.client.query({query: GET_USER, fetchPolicy: "network-only"});
      user = getUser;
      console.log(`getUser: `, getUser);
    } catch (error) {
      _handleAuthError(error, user);

    } finally {
      setUserState({
        user: user && { ...user, _id: user.id },
        loggingIn: false,
        userRequested: true
      });
    }
  };

  const getAllUsers = async () => {
    try {
      return await props.client.query({query: GET_USERS});
    }
    catch (error) {
      console.log(error);
    }
  }
  // Try to fetch logged user data to populate into userState
  if (!userState.user && !userState.userRequested) getUser();

  const logIn = async (email, password) => {
    try {
      const accPass = await accountsPassword.login({ password, user: { email } });
      return await getUser();
    } catch (err) {
      _handleAuthError(err);
      return err;
    }
  };

  const signUp = async ({ firstName, lastName, email, password, profilePicture, isCompany, cachesFound}) => {
    try {
      await accountsPassword.createUser({
        password,
        email,
        profile: {firstName, lastName, profilePicture},
        isCompany,
        cachesFound
      })
    }  catch (err) {
      _handleAuthError(err);
      return err;
    }
    await logIn(email, password);
  };

  const logOut = async () => {
    await accountsGraphQLTransport.logout();
    setUserState({ user: undefined, loggingIn: false });
    return await getUser();
  };


  function _handleAuthError(err, user) {
    console.warn("Auth error: ", err);
    setUserState({
      user: user && { ...user, _id: user.id },
      loggingIn: false,
      authErr: err
    });
  }

  return <UserContext.Provider
    value={{ userState, setUserState, getUser, signUp, logIn, logOut, getAllUsers }}>
    {props.children}
  </UserContext.Provider>;
};
export const UserProvider = withApollo(_UserProvider);