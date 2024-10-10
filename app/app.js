import {
  submitCreateTaskForm,
  uncompleteTasks,
  completedTasks,
  completeTask,
  uncompleteTask,
  createNewCategory,
  saveData,
  deleteSaveData,
  getSavedData,
  loadFromSavedData,
  readTaskList,
  beginEditingTask,
  cancelEditingTask,
  finishEditingTask,
  userCategories,
  reloadCategoryScreenTasks,
  deleteTask,
} from "../model/model.js";

// References
let completedTaskSpan = "#completed-tasks-count";
let uncompletedTaskSpan = "#uncompleted-tasks-count";
const sidebarMenus = ["#createTaskMenu", "#editTaskMenu"];
const mainSectionMenus = ["#taskMenu", "#categoryMenu", "#settingsMenu"];
const createTaskStars = [
  "#createTaskStarRadio1",
  "#createTaskStarRadio2",
  "#createTaskStarRadio3",
  "#createTaskStarRadio4",
  "#createTaskStarRadio5",
];
let lastSavedText = "#lastsavedtext";
var audioElement = null;

// Date formating settings
const rtf = new Intl.RelativeTimeFormat("en", {
  localeMatcher: "best fit", // other values: "lookup"
  numeric: "auto", // other values: "auto"
  style: "short", // other values: "short" or "narrow"
});

// ON READY, Check for storage system, init listeners
$(document).ready(function () {
  // Check Storage Availability, if available, try to load save data.
  if (typeof Storage !== "undefined") {
    // Code for localStorage/sessionStorage.
    loadFromSavedData();
  } else {
    alert("storage method not found, you may encounter issues with saved data on this site.");
    setLastSavedText("localStorage not found.");
  }
  initListeners();
  updateCategoryUI();
  audioElement = document.createElement("audio");
});

function playAudio(src) {
  audioElement.setAttribute("src", src);
  audioElement.play();
}

export function setLastSavedText(text) {
  $("#lastsavedtext").html(text);
}

// Init functionality listeners
function initListeners() {
  updateTaskCountUI();
  saveDataInitListeners();
  // Add listener for createTaskSubmit event
  $("#createTaskForm").on("submit", function (e) {
    e.preventDefault();
    submitCreateTaskForm($(this));
  });
  $("#editTaskForm")
    .find("#edit--cancel")
    .on("click", function (e) {
      e.preventDefault();
      cancelEditingTask();
    });
  $("#editTaskForm")
    .find("#edit--finishEditing")
    .on("click", function (e) {
      e.preventDefault();
      finishEditingTask();
    });

  // On starRating difficulty change
  $(".starRating input").change(function () {
    let newValue = $(this).attr("value");
    $(this)
      .closest(".starRating")
      .children("i")
      .each(function () {
        if ($(this).children("input").attr("value") <= newValue) {
          $(this).css("background-image", "url(images/star_full.png)");
        } else {
          $(this).css("background-image", "url(images/star_empty.png)");
        }
      });
  });

  // Main menu change logic
  $("#main-menu .tabElement .tab").on("click", (e) => {
    let clickedTab = e.currentTarget;

    // If we are clicking on an already active tab, ignore this input.
    if ($(clickedTab).hasClass("tab--active")) {
      return;
    }
    // console.log(clickedTab);

    let clickedTabId = clickedTab.id;
    mainSectionMenus.forEach((menu) => {
      if (menu == `#${clickedTabId}Menu`) {
        $(menu).css("display", "block");
      } else {
        $(menu).css("display", "none");
      }
    });
    $("#main-menu > .tabElement .tab").each(function () {
      if ($(this).attr("id") == clickedTabId) {
        $(this).addClass("tab--active");
      } else {
        $(this).removeClass("tab--active");
      }
    });
  });

  // Sidebar menu change logic
  $("#sidebar-menu .tabElement .tab").on("click", (e) => {
    let clickedTab = e.currentTarget;

    // If we are clicking on an already active tab, ignore this input.
    if ($(clickedTab).hasClass("tab--active")) {
      return;
    }

    let clickedTabId = clickedTab.id;
    sidebarMenus.forEach((menu) => {
      if (menu == `#${clickedTabId}Menu`) {
        $(menu).css("display", "block");
      } else {
        $(menu).css("display", "none");
      }
    });
    $("#sidebar-menu > .tabElement .tab").each(function () {
      if ($(this).attr("id") == clickedTabId) {
        $(this).addClass("tab--active");
      } else {
        $(this).removeClass("tab--active");
      }
    });
  });

  // CreateTask Category Dropdown

  $(".categorySelect").on("change", function () {
    let thisSelectObj = $(this);
    switch ($(this).find("option:selected").attr("action")) {
      case "newCategory":
        let newCategoryResponse = prompt("Enter new category name:", "");
        if (newCategoryResponse == null || newCategoryResponse == "") {
          // alert("category name invalid, terminating");
          updateCategoryUI();
          return;
        } else {
          createNewCategory(newCategoryResponse);
        }

        thisSelectObj.val("none");
        break;
      default:
        if (thisSelectObj[0].id == "categoryScreenSelect") {
        }
        break;
    }
  });
  $("#categoryScreenSelect").on("change", function () {
    reloadCategoryScreenTasks($(this).find("option:selected").attr("value"));
  });
}

export function updateCategoryUI() {
  $(".categorySelect option").remove();
  // $(".categorySelect").append(`<option value="none">none</option>`);
  if (userCategories != undefined) {
    userCategories.forEach((category) => {
      $(".categorySelect").append(`<option value="${category}">${category}</option>`);
    });
  }
  $(".categorySelect").append(`<option action="newCategory" value="newCategory">
                    + New Category
                  </option>`);
}

// InitListeners for saveData Btns specifically
function saveDataInitListeners() {
  $("#settings-saveBtn").on("click", function (e) {
    saveData();
  });
  $("#settings-deleteSaveDataBtn").on("click", function (e) {
    deleteSaveData();
  });
  $("#settings-printSavedData").on("click", function (e) {
    let savedDataLocal = getSavedData();
    if (savedDataLocal != undefined) {
      console.log(savedDataLocal);
    } else {
      console.log("no saved data found.");
    }
  });
  $("#settings-printTaskData").on("click", function (e) {
    readTaskList();
  });
}

// Function for displaying text in the bottom left corner of the screen.
let fadeEffect = null;
export function screenImportantAlert(text, messageColor) {
  let messageColorResult = "white";
  switch (messageColor) {
    case 1:
      messageColorResult = "#13cf1c";
      break;
    case 2:
      messageColorResult = "#cc1620";
      break;
  }

  $("#screen-important-alerts").css("color", messageColorResult);
  $("#screen-important-alerts").html(text);
  $("#screen-important-alerts").css("opacity", 1);

  var fadeTarget = document.getElementById("screen-important-alerts");
  fadeTarget.style.opacity = 1.5; // Setting to greather than 1 gives buffer space for the fade effect without any visual difference.
  clearInterval(fadeEffect);
  fadeEffect = null;

  fadeEffect = setInterval(function () {
    if (!fadeTarget.style.opacity) {
      fadeTarget.style.opacity = 1;
    }
    if (fadeTarget.style.opacity > 0) {
      fadeTarget.style.opacity -= 0.1;
    } else {
      clearInterval(fadeEffect);
      fadeEffect = null;
    }
  }, 200);
}

// Called when the starDifficulty is selected. Star select is a ratio box, this code makes the stars gold or empty depending on input.
// function updateStarDifficultyUi(current) {
//   console.log(current[0].value);

//   if (current == null) {
//     const firstStarRadioBtn = createTaskStars[0];
//     current = $(firstStarRadioBtn);
//     $(current).prop("checked", true);
//   }
//   $.each(createTaskStars, (index, value) => {
//     if (index < current.val()) {
//       $(value).parent().css("background-image", "url(images/star_full.png)");
//     } else {
//       $(value).parent().css("background-image", "url(images/star_empty.png)");
//     }
//   });
// }

// Creates, populates, and appends to the DOM a task element.
export function createNewTaskElement(taskObjectRef, appendTo, isTaskComplete = false) {
  if (taskElementTemplate == null) {
    return console.error("task element template not found!");
  }
  let $newTaskObj = $("#taskElementTemplate").clone();
  $newTaskObj.removeAttr("id");

  $newTaskObj.find("#task--title").html(taskObjectRef["taskTitle"]);
  $newTaskObj.find("#task--description").html(taskObjectRef["taskDescription"]);
  $newTaskObj.find("#task--value").html(taskObjectRef["taskReward"]);

  if (taskObjectRef["category"] != "none")
    $newTaskObj.find("#categoryText").html(`${taskObjectRef["category"]}`);

  // categoryText;

  let taskObjectRefString = JSON.stringify(taskObjectRef);
  $newTaskObj.attr("task--data", taskObjectRefString);

  $newTaskObj.find("#taskEditBtn").on("click", function () {
    beginEditingTask($(this).closest("li").attr("task--data"));
  });
  $newTaskObj.find("#taskDeleteBtn").on("click", function () {
    let confirmText = "Click again to confirm";
    if ($(this).find(".tooltiptext").html() == confirmText) {
      deleteTask($(this).closest("li").attr("task--data"));
    } else {
      $(this).find(".tooltiptext").html(confirmText);
      setTimeout(() => {
        $(this).find(".tooltiptext").html("Delete Task");
      }, 1000);
    }
  });
  if (!isTaskComplete) {
    $newTaskObj.find("#taskUncompleteBtn").css("display", "none");

    $newTaskObj.find("#taskCompleteBtn").on("click", function () {
      $newTaskObj.find(".stats").css("display", "none");
      $newTaskObj.find(".options").css("display", "none");
      $newTaskObj.find(".goldCollect").css("display", "flex");
    });

    $newTaskObj.find(".goldCollect").on("click", function () {
      let thisTaskObject = $(this).closest("li");
      playAudio("../audio/000000f1_purchasepurchaseRepeat.mp3");

      // Get the task's element in the list. Pass this to completeTask
      completeTask($(this).closest("li"));
    });
  } else {
    $newTaskObj.find("#taskCompleteBtn").css("display", "none");
    $newTaskObj.find("#taskUncompleteBtn").on("click", function () {
      let thisTaskObject = $(this).closest("li");

      // Get the task's element in the list. Pass this to completeTask
      uncompleteTask($(this).closest("li"));
    });
  }

  const date1 = Date.now();
  const date2 = taskObjectRef["dueDate"];
  const diffTime = date2 - date1;
  if (date2 != "none") {
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    // console.log("date1", date1, "date2", date2);
    // console.log(diffTime);
    // console.log(diffDays);
    // console.log(diffHours);
    // console.log(diffMinutes);

    let timeRemaining = "null";
    if (diffDays >= 1 || (diffDays <= -1 && diffMinutes <= -60)) {
      timeRemaining = rtf.format(diffDays, "day"); // "in # days";
    } else if (diffHours >= 1 || (diffHours < -1 && diffMinutes <= -60)) {
      timeRemaining = rtf.format(diffHours, "hours"); // "in # hours";
    } else {
      timeRemaining = rtf.format(diffMinutes, "minutes"); // "in # hours";
    }
    $newTaskObj.find("#task--timeRemaining").html(timeRemaining);
  } else {
    $newTaskObj.find("#task--timeRemaining").html("");
    $newTaskObj.find(".timeIcon").css("display", "none");
  }

  $newTaskObj
    .find(".starRating")
    .children()
    .each(function (i) {
      if (i + 1 <= taskObjectRef.starRating) {
        $(this).addClass("starFull");
      }
    });

  $newTaskObj.css("display", "flex");

  $newTaskObj.appendTo(appendTo);

  if (!isTaskComplete && diffTime < 0) {
    $newTaskObj.find("#task--timeRemaining").css("color", "red");
  }
  updateTaskCountUI();
}

// Update count by the details / summary elements
export function updateTaskCountUI() {
  $(uncompletedTaskSpan).html(`[${uncompleteTasks.length}]`);
  $(completedTaskSpan).html(`[${completedTasks.length}]`);
}

// Simple function to clear form elements easily.
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
}
