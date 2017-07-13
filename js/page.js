$(function () {
  $('#search').focus();
});

function openNav() {
    document.getElementById("mySidenav").style.height = "250px";
    document.getElementById("main").style.marginTop = "250px";
    document.getElementById("main").style.filter = "blur(1.5px)";
}

function closeNav() {
    document.getElementById("mySidenav").style.height = "0";
    document.getElementById("main").style.marginTop= "0";
    document.getElementById("main").style.filter = "blur(0px)";
}

// ===== Scroll to Top ====
$(window).scroll(function() {
  if ($(this).scrollTop() >= 100) {        // If page is scrolled more than 50px
      $('#return-to-top').fadeIn(200);    // Fade in the arrow
  } else {
      $('#return-to-top').fadeOut(200);   // Else fade out the arrow
  }
});

function rTT(){      // When arrow is clicked
  $('html, body').animate({
     scrollTop : 0                      // function call
  }, 500);
  $('#search').focus();
  return false;
}
