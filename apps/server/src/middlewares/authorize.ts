import { AssetTypeV1 } from '#/constants';
import { ExceptionCode } from '#/constants/exception';
import { verify } from '@/platform/jwt';
import { Next } from 'koa';
import { getAssetPublicPathV1 } from '@/platform/asset';
import { getUserById, Property } from '@/db/user';
import { Context } from '@/constants/koa';

export default async (ctx: Context, next: Next) => {
  const token = ctx.get('authorization');

  if (!token) {
    return ctx.except(ExceptionCode.NOT_AUTHORIZE);
  }

  let userId: string;
  try {
    userId = verify(token);
  } catch (error) {
    return ctx.except(ExceptionCode.NOT_AUTHORIZE);
  }

  const user = await getUserById(userId, Object.values(Property));

  if (!user) {
    return ctx.except(ExceptionCode.NOT_AUTHORIZE);
  }

  ctx.user = {
    ...user,
    avatar: getAssetPublicPathV1(user.avatar, AssetTypeV1.USER_AVATAR),
  };
  return next();
};
