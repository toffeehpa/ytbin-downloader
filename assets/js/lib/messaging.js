(() => {
  const send = async (type, payload = {}) => {
    try {
      const response = await browser.runtime.sendMessage({ type, ...payload });
      if (typeof response === "undefined") {
        throw new Error("An error occurred, Please try again.");
      }
      return response;
    } catch (error) {
      return {
        error: true,
        errorMessage: error?.message || "An error occurred, Please try again."
      };
    }
  };

  window.Messaging = { send };
})();