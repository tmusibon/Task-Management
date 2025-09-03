import React, { createContext, useReducer, useEffect } from "react";
import { AuthState, User } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
};

type AuthAction =
  | {
      type: "LOGIN_SUCCESS";
      payload: { user: User; token: string };
    }
  | { type: "REGISTER_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_ERROR" }
  | { type: "LOGOUT" }
  | { type: "USER_LOADED"; payload: User }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case "USER_LOADED":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    case "AUTH_ERROR":
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial app load
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUser = async () => {
    if (localStorage.getItem("token")) {
      try {
        const user = await authAPI.getProfile();
        dispatch({ type: "USER_LOADED", payload: user });
      } catch (err) {
        dispatch({ type: "AUTH_ERROR" });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (err) {
      dispatch({ type: "AUTH_ERROR" });
      throw err;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const data = await authAPI.register(username, email, password);
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: { user: data.user, token: data.token },
      });
    } catch (err) {
      dispatch({ type: "AUTH_ERROR" });
      throw err;
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
