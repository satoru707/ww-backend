export function getAccessTokenFromReq(
  req: Express.Request,
): string | undefined {
  try {
    return req?.cookies && typeof req.cookies.access_token === 'string'
      ? req.cookies.access_token
      : undefined;
  } catch {
    return undefined;
  }
}

export function getRefreshTokenFromReq(
  req: Express.Request,
): string | undefined {
  try {
    return req?.cookies && typeof req.cookies.refresh_token === 'string'
      ? req.cookies.refresh_token
      : undefined;
  } catch {
    return undefined;
  }
}
