import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import crypto from 'node:crypto';

import User from '../db/models/User.js';
import Session from '../db/models/Session.js';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const createSession = async (userId) => {
  await Session.deleteOne({ userId });

  const accessToken = crypto.randomBytes(30).toString('hex');
  const refreshToken = crypto.randomBytes(30).toString('hex');

  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAYS);

  return await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
};

export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  const newUser = await User.create({
    ...payload,
    password: encryptedPassword,
  });

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const session = await createSession(user._id);

  return session;
};

export const refreshUsersSession = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not found');
  }

  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const newSession = await createSession(session.userId);

  await Session.deleteOne({ _id: session._id });

  return newSession;
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  await Session.deleteOne({ refreshToken });
};