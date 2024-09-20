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

function updateStarDifficultyUi(current) {
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
        case "datetime-local":
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
  updateStarDifficultyUi();
}

const rtf = new Intl.RelativeTimeFormat("en", {
  localeMatcher: "best fit", // other values: "lookup"
  numeric: "always", // other values: "auto"
  style: "long", // other values: "short" or "narrow"
});

export function createNewTaskElement(taskObjectRef) {
  if (taskElementTemplate == null) {
    return console.error("task element template not found!");
  }
  console.log("new task object ", taskObjectRef);
  let $newTaskObj = $("#taskElementTemplate").clone();

  $newTaskObj.find("#task--title").html(taskObjectRef["taskTitle"]);
  $newTaskObj.find("#task--description").html(taskObjectRef["taskDescription"]);
  $newTaskObj.find("#task--value").html(taskObjectRef["taskReward"]);

  const date1 = Date.now();
  const date2 = new Date(taskObjectRef["dueDate"]).getTime();
  const diffTime = date2 - date1;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  let timeRemaining = "null";
  if (Math.abs(diffDays) > 1) {
    timeRemaining = rtf.format(diffDays, "day"); // "in # days";
  } else if (Math.abs(diffHours) > 1) {
    timeRemaining = rtf.format(diffHours, "hours"); // "in # hours";
  } else {
    timeRemaining = rtf.format(diffMinutes, "minutes"); // "in # hours";
  }

  $newTaskObj.find("#task--timeRemaining").html(timeRemaining);

  $newTaskObj
    .find(".starRating")
    .children()
    .each(function (i) {
      if (i + 1 <= taskObjectRef.starRating) {
        $(this).addClass("starFull");
      }
    });

  $newTaskObj.css("display", "block");
  $newTaskObj.appendTo("#uncompleted-tasks-list");
}
