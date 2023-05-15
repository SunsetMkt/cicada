import fs from 'fs/promises';
import { ExceptionCode } from '#/constants/exception';
import { getMusicbillById } from '@/db/musicbill';
import {
  getMusicbillMusicList,
  Property as MusicbillMusicProperty,
} from '@/db/musicbill_music';
import { getDB } from '@/db';
import { getTrashDirectory } from '@/config';
import { MusicbillProperty } from '@/constants/db_definition';
import { Context } from '../constants';

export default async (ctx: Context) => {
  const { id } = ctx.query as { id?: string };
  if (typeof id !== 'string' || !id.length) {
    return ctx.except(ExceptionCode.PARAMETER_ERROR);
  }

  const musicbill = await getMusicbillById(
    id,
    Object.values(MusicbillProperty),
  );
  if (!musicbill || musicbill.userId !== ctx.user.id) {
    return ctx.except(ExceptionCode.MUSICBILL_NOT_EXIST);
  }

  const musicList = await getMusicbillMusicList(id, [
    MusicbillMusicProperty.MUSIC_ID,
    MusicbillMusicProperty.ADD_TIMESTAMP,
  ]);
  await fs.writeFile(
    `${getTrashDirectory()}/deleted_musicbill_${id}.json`,
    JSON.stringify({
      ...musicbill,
      musicList,
    }),
  );

  /**
   * 从数据库移除
   */
  await Promise.all([
    getDB().run(
      `
        DELETE FROM musicbill_music
        WHERE musicbillId = ?
      `,
      [id],
    ),
    getDB().run(
      `
        DELETE FROM musicbill_export
        WHERE musicbillId = ?
      `,
      [id],
    ),
  ]);
  await getDB().run(
    `
      DELETE FROM musicbill
      WHERE id = ?
    `,
    [id],
  ); // musicbill

  return ctx.success();
};
