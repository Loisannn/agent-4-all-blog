import { jsonOk } from '../../../src/cms/http';
import type { Env } from '../../../src/cms/types';
import type { AdminData } from './_middleware';

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({ data }) => {
  return jsonOk({ user: data.user, email: data.user.email });
};
