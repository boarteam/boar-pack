import { PageLoading } from "@ant-design/pro-layout";
import { PureAbility } from "@casl/ability";
import { unpackRules } from "@casl/ability/extra";
import { stringify } from "querystring";
import { history } from '@umijs/max';
import { Action } from "@/tools/action.enum";
import defaultSettings, { appSettings } from "@/../config/defaultSettings";
import { CancelablePromise } from "@@api/generated";

export const loginPath = appSettings.loginPath;
const resetPasswordPath = appSettings.resetPasswordPath;

export function goToLogin(forceSearch?: string) {
  const { search, pathname } = history.location;
  if (pathname !== loginPath) {
    console.log(`Redirect to ${loginPath}`);
    let searchParam = '';
    if (typeof forceSearch === 'string') {
      searchParam = forceSearch;
    } else if (pathname !== '/') {
      searchParam = stringify({
        redirect: pathname + search,
      });
    }
    history.replace({
      pathname: loginPath,
      search: searchParam,
    });
  } else {
    console.log('Staying on login page, redirect is not necessary');
  }
}

export function goToMain() {
  if (!history) return;
  // @ts-ignore
  const { query = {} } = history.location;
  const { redirect } = query as { redirect: string };
  const url = redirect || '/';
  history.push(url);
}

export async function fetchUserInfo<TUser>(fetchUserInfoCallback: () => CancelablePromise<TUser>) {
  try {
    return fetchUserInfoCallback();
  } catch (error) {
    console.error('Error while fetching user info, redirecting to login');
    console.error(error);
    goToLogin();
  }
  return undefined;
}

export async function logout(logoutCallback: () => CancelablePromise<void>) {
  await logoutCallback();
  goToLogin();
}

export const initialStateConfig = {
  loading: <PageLoading />,
};

export type TInitialState<TUser> = {
  settings?: typeof defaultSettings;
  currentUser?: TUser;
  currentCompany?: string;
  loading?: boolean;
  ability?: PureAbility<[Action, string]>,
}

export function onPageChange<TUser>(initialState?: TInitialState<TUser>) {
  const currentUser = initialState?.currentUser;

  if (!currentUser) {
    console.log('There is no current user in the state, going to login');
    goToLogin();
    return;
  }
}

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-initial-state
 */
export async function getInitialState<TUser>(
    afterLogin = false,
    projectSettings: typeof defaultSettings = {},
    fetchUserInfoCallback: () => CancelablePromise<TUser>
): Promise<TInitialState<TUser>> {
  const ability = new PureAbility<[Action, string]>();
  const pathname = history.location.pathname;

  const state: TInitialState<TUser> = {
    settings: {
      ...defaultSettings,
      ...projectSettings
    },
    ability,
  };

  if (![loginPath, resetPasswordPath].some(path => pathname.startsWith(path)) || afterLogin) {
    const currentUser = await fetchUserInfo(fetchUserInfoCallback);

    if (!currentUser) {
      console.log('User is not authenticated');
      throw new Error('User is not authenticated');
    }

    console.log('User is authenticated and ready to work with the system');
    ability.update(unpackRules(currentUser.policies));
    state.currentUser = currentUser;
  }

  return state;
}
