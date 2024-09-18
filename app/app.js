import { submitCreateTaskForm } from "../model/model.js";

export const createTaskStars = [
  "#createTaskStarRadio1",
  "#createTaskStarRadio2",
  "#createTaskStarRadio3",
  "#createTaskStarRadio4",
  "#createTaskStarRadio5",
];

// Create Task Form
$("#createTaskForm").on("submit", function (e) {
  e.preventDefault();
  submitCreateTaskForm($(this));
});

$("#createTaskForm .starRating input").change(function () {
  updateStarDifficultyUi($(this));
});

const sidebarMenus = ["#createTaskMenu", "#editTaskMenu"];
$("#sidebar-menu .tab").on("click", (e) => {
  let clickedTab = e.currentTarget;
  // console.log(clickedTab);

  // If we are clicking on an already active tab, ignore this input.
  // if ($(clickedTab).hasClass("tab--active")) {
  //   return;
  // }

  let clickedTabId = clickedTab.id;
  sidebarMenus.forEach((menu) => {
    if (menu == `#${clickedTabId}Menu`) {
      $(menu).css("display", "block");
    } else {
      $(menu).css("display", "none");
    }
  });
  $("#sidebar-menu > .tab").each(function () {
    if ($(this).attr("id") == clickedTabId) {
      $(this).addClass("tab--active");
    } else {
      $(this).removeClass("tab--active");
    }
  });
});

export function updateStarDifficultyUi(current) {
  if (current == null) {
    const firstStarRadioBtn = createTaskStars[0];
    current = $(firstStarRadioBtn);
    $(current).prop("checked", true);
  }
  $.each(createTaskStars, (index, value) => {
    if (index < current.val()) {
      $(value).parent().css("background-image", "url(images/star_full.png)");
    } else {
      $(value).parent().css("background-image", "url(images/star_empty.png)");
    }
  });
}

export function clear_form_elements(formId) {
  jQuery(formId)
    .find(":input")
    .each(function () {
      switch (this.type) {
        case "password":
        case "text":
        case "textarea":
        case "file":
        case "select-one":
        case "select-multiple":
        case "date":
        case "number":
        case "tel":
        case "email":
          jQuery(this).val("");
          break;
        case "checkbox":
        case "radio":
          this.checked = false;
          break;
      }
    });
}

let p = document.getElementById("para1");

function createNewTaskElement() {
  let p_prime = p.cloneNode(true);

  // add the text node to the newly created div
  newDiv.appendChild(newContent);

  // add the newly created element and its content into the DOM
  const currentDiv = document.getElementById("div1");
  document.body.insertBefore(newDiv, currentDiv);
}
