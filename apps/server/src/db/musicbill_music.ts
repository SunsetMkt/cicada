import * as db from '.';

export enum Property {
  ID = 'id',
  MUSICBILL_ID = 'musicbillId',
  MUSIC_ID = 'musicId',
  ADD_TIMESTAMP = 'addTimestamp',
}

export type Music = {
  [Property.ID]: string;
  [Property.MUSICBILL_ID]: string;
  [Property.MUSIC_ID]: string;
  [Property.ADD_TIMESTAMP]: number;
};

export function getMusicbillMusic<P extends Property>(
  musicbillId: string,
  musicId: string,
  properties: P[],
) {
  return db.get<{
    [key in P]: Music[key];
  }>(
    `
      select ${properties.join(',')} from musicbill_music
        where musicbillId = ? and musicId = ?
    `,
    [musicbillId, musicId],
  );
}

export function addMusicbillMusic(musicbillId: string, musicId: string) {
  return db.run(
    `
      insert into musicbill_music(musicbillId, musicId, addTimestamp)
        values(?, ?, ?)
    `,
    [musicbillId, musicId, Date.now()],
  );
}