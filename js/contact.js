		let lastScrollY = window.scrollY;
		const header = document.querySelector("header");

		window.addEventListener("scroll", () => {
			const currentScrollY = window.scrollY;

			// shadow effect after slight scroll
			if (currentScrollY > 50) {
				header.classList.add("scrolled");
			} else {
				header.classList.remove("scrolled");
			}

			// hide/show logic
			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				header.classList.add("hide"); // scrolling down
			} else {
				header.classList.remove("hide"); // scrolling up
			}

			lastScrollY = currentScrollY;
		});

          (function () {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -30px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  })();