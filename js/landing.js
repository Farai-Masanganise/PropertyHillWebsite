  (function () {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });

    // Drag-to-scroll for review track
    const track = document.querySelector('.reviews-track');
    if (track) {
      let isDown = false, startX, scrollLeft;
      track.addEventListener('mousedown',  e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft; });
      track.addEventListener('mouseleave', ()  => { isDown = false; });
      track.addEventListener('mouseup',    ()  => { isDown = false; });
      track.addEventListener('mousemove',  e   => {
        if (!isDown) return;
        e.preventDefault();
        track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX);
      });

      // Arrow controls
      const [prev, next] = document.querySelectorAll('.reviews-controls button');
      if (prev && next) {
        prev.addEventListener('click', () => track.scrollBy({ left: -400, behavior: 'smooth' }));
        next.addEventListener('click', () => track.scrollBy({ left:  400, behavior: 'smooth' }));
      }
    }
  })();