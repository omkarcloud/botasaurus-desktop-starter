import cogoToast from 'cogo-toast-react-17-fix';

class CogoToastHandler {
  private hideFnsArray: (() => void)[] = [];

  hideAll() {
    if (this.hideFnsArray.length) {
      for (let index = 0; index < this.hideFnsArray.length; index++) {
        const element = this.hideFnsArray[index];
        element();
      }
      this.hideFnsArray = [];
    }
  }

  checkingForUpdates() {
    this.hideAll();
    const { hide } = cogoToast.loading('Checking for updates...', {
      hideAfter: 0,
      position: 'bottom-right',
      onClick: async () => {
        hide!();
      },
    });
    this.hideFnsArray.push(hide!);
  }

  downloadingUpdates() {
    this.hideAll();
    const { hide } = cogoToast.loading('Downloading updates...', {
      hideAfter: 0,
      position: 'bottom-right',
      onClick: async () => {
        hide!();
      },
    });
    this.hideFnsArray.push(hide!);
  }

  quittingToApplyUpdates() {
    this.hideAll();
    const { hide } = cogoToast.info(
      'Quitting to apply updates in 10 seconds...',
      {
        hideAfter: 0,
        position: 'bottom-right',
        onClick: async () => {
          hide!();
        },
      },
    );
    this.hideFnsArray.push(hide!);
  }

  success(version) {
    this.hideAll();
    
    const { hide } = cogoToast.success(
      `Good news! You're already on the latest version, which is version ${version}.`,
      {
        hideAfter: 10,
        position: 'bottom-right',
        onClick: async () => {
          hide!();
        },
      },
    );
    this.hideFnsArray.push(hide!);
  }
}

const cogoToastHandler = new CogoToastHandler();

const cogoToastRoute = {
  checkingForUpdates: () => cogoToastHandler.checkingForUpdates(),
  downloadingUpdates: () => cogoToastHandler.downloadingUpdates(),
  quittingToApplyUpdates: () => cogoToastHandler.quittingToApplyUpdates(),
  // @ts-ignore
  success: (...args) => cogoToastHandler.success(...args),
  hideAll: () => cogoToastHandler.hideAll(),
};
export default cogoToastRoute;
