import { get, put, BlobPreconditionFailedError } from '@vercel/blob';
const conflict = () => Object.assign(new Error('Another device updated the journal. Choose which copy to keep.'), { status: 409 });
const unavailable = () => Object.assign(new Error('Unable to load the existing cloud journal. Please retry; your local copy is preserved.'), { status: 503 });
const journalPath = user => `journals/${user}/state.json`;
const imagePath = (user, id) => `charts/${user}/${id}`;

// Call only after the API has verified the signed-in user's access; all paths are scoped to their verified user ID.
export function createStorage(blob = { get, put }) {
  async function currentJournal(user, client) {
    const result = await blob.get(journalPath(user), { access: 'private', useCache: false });
    if (result) {
      if (result.statusCode !== 200 || !result.stream || !result.blob.etag) throw unavailable();
      const data = await new Response(result.stream).json();
      if (!Number.isInteger(data.revision) || data.revision < 0) throw unavailable();
      return { data, etag: result.blob.etag };
    }
    // Preserve existing records: only initialize from a successful legacy read.
    // A failed legacy read must never be mistaken for an empty journal.
    const { data, error } = await client.from('tradebook_journals').select('revision,state').eq('user_id', user).maybeSingle();
    if (error) throw unavailable();
    return { data: data || { revision: 0, state: null }, etag: null };
  }
  return {
    async loadJournal(user, client) { return (await currentJournal(user, client)).data; },
    async saveJournal(user, client, revision, state) {
      const current = await currentJournal(user, client);
      if (current.data.revision !== revision) throw conflict();
      try {
        await blob.put(journalPath(user), JSON.stringify({ revision: revision + 1, state }), {
          access: 'private', addRandomSuffix: false, contentType: 'application/json',
          allowOverwrite: Boolean(current.etag), ...(current.etag ? { ifMatch: current.etag } : {}),
        });
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError || error?.name === 'BlobPreconditionFailedError' || error?.name === 'BlobPathnameConflictError') throw conflict();
        // For two simultaneous first saves, an existing pathname is also a conflict.
        if (!current.etag) {
          const winner = await blob.get(journalPath(user), { access: 'private', useCache: false });
          if (winner) throw conflict();
        }
        throw error;
      }
      return { revision: revision + 1 };
    },
    async loadImage(user, id, client) {
      const result = await blob.get(imagePath(user, id), { access: 'private', useCache: false });
      if (result?.statusCode === 200) return { bytes: Buffer.from(await new Response(result.stream).arrayBuffer()), type: result.blob.contentType || 'application/octet-stream' };
      // Legacy images remain readable; no existing objects are deleted.
      const { data, error } = await client.storage.from('tradebook-charts').download(user + '/' + id);
      if (error) throw Object.assign(new Error('Screenshot unavailable.'), { status: 404 });
      return { bytes: Buffer.from(await data.arrayBuffer()), type: data.type };
    },
    async saveImage(user, id, bytes, type) {
      await blob.put(imagePath(user, id), bytes, { access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: type });
      return { id, url: '/api/images/' + id };
    },
  };
}
export const storage = createStorage();
