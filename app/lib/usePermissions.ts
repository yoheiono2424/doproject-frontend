import { useAuthStore } from './store';

/**
 * 権限判定フック
 *
 * 高権限ユーザーの定義：
 * 1. 役職が「部長」または「役員」
 * 2. 部署が「総務部」
 * 3. hasAdminPermission が true
 *
 * いずれか1つでも該当すれば高権限ユーザー
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  /**
   * 高権限を持つかどうかを判定
   */
  const hasHighPermission = (): boolean => {
    if (!user) return false;

    // 役職による判定（部長または役員）
    if (user.jobTitle === '部長' || user.jobTitle === '役員') {
      return true;
    }

    // 部署による判定（総務部）
    if (user.department.includes('総務部')) {
      return true;
    }

    // 個別権限フラグによる判定
    if (user.hasAdminPermission) {
      return true;
    }

    return false;
  };

  /**
   * 従業員管理の編集・削除権限を持つか
   */
  const canAccessEmployeeManagement = (): boolean => {
    return hasHighPermission();
  };

  /**
   * 案件管理の詳細編集権限を持つか
   */
  const canEditProjectDetails = (): boolean => {
    return hasHighPermission();
  };

  /**
   * 操作ログへのアクセス権限を持つか
   */
  const canAccessOperationLog = (): boolean => {
    return hasHighPermission();
  };

  return {
    hasHighPermission,
    canAccessEmployeeManagement,
    canEditProjectDetails,
    canAccessOperationLog,
    user,
  };
};
