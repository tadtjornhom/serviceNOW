/**
 * Created by ttjornhom on 11/28/17.
 */


getUserAccountTeamAccountIds

(function executeRule(current, previous /*null when async*/) {
    var teamUtil = new AccountTeamUtil();
    if (teamUtil.hasUniqueResponsibility(current.responsibility)) {
        if (teamUtil.hasAccountTeamResponsibility(current.account, current.responsibility)) {
            gs.addErrorMessage(gs.getMessage("{0} already has {1} as unique responsibility, duplicate not allowed for this account", [current.account.getDisplayValue(), current.responsibility.getDisplayValue()]));
            current.setAbortAction(true);
            return;
        }
    }
})(current, previous);