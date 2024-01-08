class DeadLinkChecker {
  // Variables
  #externalLinksElements = Array.from(
    document.querySelector("#bodyContent").querySelectorAll(".external.text")
  );
  #externalLinks = this.#externalLinksElements.map((elt) => elt.href);

  // Methods

  async #sendLinks(url = "", data) {
    // function to post links to the python server
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  #mountResultsDiv(innerhtml) {
    //Mounts a results dive to the bottom right of the page
    const resultsDiv = document.createElement("div");
    resultsDiv.id = "results-div";
    resultsDiv.innerHTML = `${innerhtml}`;
    resultsDiv.style.position = "absolute";
    resultsDiv.style.position = "fixed";
    resultsDiv.style.bottom = "0px";
    resultsDiv.style.right = "0px";

    document.getElementById("bodyContent").appendChild(resultsDiv);
  }

  #splitLinksIntoBatches(arr, batchSize) {
    // splits an array into batches not greater than the batchSize
    let batches = [];
    for (let i = 0; i < arr.length; i += batchSize) {
      batches.push(arr.slice(i, i + batchSize));
    }
    return batches;
  }

  #processServerdata(item) {
    const position = this.#externalLinks.indexOf(item.link);
    const linkElement =
      document.getElementsByClassName("external text")[position];
    linkElement.insertAdjacentHTML(
      "afterend",
      `<span style="color:red">${item.status_code}</span>`
    );
  }

  async findDeadLinks() {
    if (this.#externalLinks.length > 0) {
      const batchSize = 10;
      const externalLinksSize = this.#externalLinks.length;

      if (externalLinksSize > batchSize) {
        // split the links into batches of not more that 15 links and send each batch to the python server
        let batches = this.#splitLinksIntoBatches(
          this.#externalLinks,
          batchSize
        );

        let count = 0;
        for (let i = 0; i < batches.length; i++) {
          console.log(`batch ${i}`, batches[i]);
          const data = await this.#sendLinks(
            "https://deadlinkchecker.toolforge.org/checklinks",
            batches[i]
          );
          if (data) {
            console.log(`batch ${i}`, data);
            data.forEach((item) => {
              this.#processServerdata(item);
            });
          }
          count += data.length;
          console.log(count);
        }
      } else {
        const data = await this.#sendLinks(
          "https://deadlinkchecker.toolforge.org/checklinks",
          this.#externalLinks
        );
        if (data) {
          data.forEach((item) => {
            this.#processServerdata(item);
          });
        }
      }
    }
  }
}

//start to find the links, once the page is loaded
const deadLinkChecker = new DeadLinkChecker();
deadLinkChecker.findDeadLinks();

