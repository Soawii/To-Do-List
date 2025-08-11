import {format} from "date-fns";
import PubSub from 'pubsub-js';
import { ToDoItem, ToDoList, ToDoProject, ToDoProjectView, list } from "./todo";

export default class DOMController {
    constructor() {
        this.dom_projects = document.getElementById("projects");
        this.dom_header = document.getElementById("header");
        this.dom_items = document.getElementById("items");
        this.dom_add_item_projects = document.getElementById("add-item-project");
        this.dom_projects_and_add = document.getElementById("projects-and-add");

        // theme
        const checkbox_theme = document.querySelector("#checkbox-theme");
        const updateTheme = () => {
            if (document.documentElement.hasAttribute("theme")) {
                document.documentElement.removeAttribute("theme");
            }
            else {
                document.documentElement.setAttribute("theme", "dark");
            }
        };
        checkbox_theme.addEventListener("change", (e) => {
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    updateTheme();
                });
            }
            else {
                updateTheme();
            }
        });


        // add item modal
        const add_item = document.getElementById("add-item");
        const add_item_dialog = document.getElementById("add-item-dialog");
        const add_item_cancel = document.querySelector(`#add-item-dialog input[value="Cancel"]`);
        const add_item_project = document.querySelector(`#add-item-project`);
        const add_item_title = document.querySelector(`#add-item-title`);
        const add_item_description = document.querySelector(`#add-item-description`);
        const add_item_date = document.querySelector(`#add-item-date`);
        const add_item_priority = document.querySelector(`#add-item-priority`);
        const add_item_form = document.querySelector(`#add-item-dialog form`);
        add_item.addEventListener("click", (e) => {
            add_item_dialog.showModal();
        }); 
        add_item_cancel.addEventListener("click", (e) => {
            add_item_dialog.close();
        });
        add_item_form.addEventListener("submit", (e) => {
            e.preventDefault();
            add_item_dialog.close(JSON.stringify({
                project: add_item_project.value,
                title: add_item_title.value,
                description: add_item_description.value,
                date: add_item_date.value,
                priority: add_item_priority.value,
            }));
        }); 
        add_item_dialog.addEventListener("close", (e) => {
            if (add_item_dialog.returnValue == "")
                return;
            PubSub.publish("new-item", add_item_dialog.returnValue);
        });

        // edit item modal
        this.edit_item_dialog = document.getElementById("edit-item-dialog");
        this.edit_item_hidden = document.getElementById("hidden-item-id");
        const edit_item_cancel = document.querySelector(`#edit-item-dialog input[value="Cancel"]`);
        const edit_item_form = document.querySelector(`#edit-item-dialog form`);
        this.edit_item_title = document.querySelector(`#edit-item-title`);
        this.edit_item_description = document.querySelector(`#edit-item-description`);
        this.edit_item_date = document.querySelector(`#edit-item-date`);
        this.edit_item_priority = document.querySelector(`#edit-item-priority`);
        edit_item_cancel.addEventListener("click", (e) => {
            this.edit_item_dialog.close();
        });
        edit_item_form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.edit_item_dialog.close(JSON.stringify({
                item: this.edit_item_hidden.value,
                title: this.edit_item_title.value,
                description: this.edit_item_description.value,
                date: this.edit_item_date.value,
                priority: this.edit_item_priority.value,
            }));
        }); 
        this.edit_item_dialog.addEventListener("close", (e) => {
            if (this.edit_item_dialog.returnValue == "")
                return;
            PubSub.publish("edit-item", this.edit_item_dialog.returnValue);
        });

        // add project button
        const add_project = document.getElementById("add-project");
        add_project.addEventListener("click", e => {
            PubSub.publish("add-project", "New Project");
        });

        // sort button and modal
        const sort = document.getElementById("sort");
        const sort_dialog = document.getElementById("sort-dialog");
        const sort_cancel = document.querySelector(`#sort-dialog input[value="Cancel"]`);
        const sort_form = document.querySelector(`#sort-dialog form`);
        const sort_field = document.getElementById("field");
        const sort_direction = document.getElementById("direction");
        sort.addEventListener("click", e => {
            sort_dialog.showModal();
        });
        sort_cancel.addEventListener("click", (e) => {
            sort_dialog.close();
        });
        sort_form.addEventListener("submit", (e) => {
            e.preventDefault();
            sort_dialog.close(JSON.stringify({
                field: sort_field.value,
                direction: sort_direction.value,
            }));
        }); 
        sort_dialog.addEventListener("close", (e) => {
            if (sort_dialog.returnValue == "")
                return;
            PubSub.publish("sort", sort_dialog.returnValue);
            sort_dialog.returnValue = "";
        });

        // filter dialog
        const filter = document.getElementById("filter");
        const filter_dialog = document.getElementById("filter-dialog");
        const filter_cancel = document.querySelector(`#filter-dialog input[value="Cancel"]`);
        const filter_form = document.querySelector(`#filter-dialog form`);
        const filter_field = document.getElementById("filter-field");
        const filter_operator = document.getElementById("filter-operator");
        const filter_text = document.getElementById("filter-input-text");
        const filter_number = document.getElementById("filter-input-number");
        const filter_date = document.getElementById("filter-input-date");
        filter.addEventListener("click", e => {
            filter_dialog.showModal();
        });
        filter_cancel.addEventListener("click", (e) => {
            filter_dialog.close();
        });
        filter_form.addEventListener("submit", (e) => {
            e.preventDefault();
            filter_dialog.close(JSON.stringify({
                field: filter_field.value,
                operator: filter_operator.value,
                values: {
                    text: filter_text.value ? filter_text.value : "Default Text",
                    number: filter_number.value ? filter_number.value : 1,
                    date: filter_date.value ? filter_date.value : format(new Date(), "yyyy-MM-dd"),
                }
            }));
        }); 
        filter_dialog.addEventListener("close", (e) => {
            if (filter_dialog.returnValue == "")
                return;
            PubSub.publish("filter", filter_dialog.returnValue);
            filter_dialog.returnValue = "";
        }); 

        // update
        PubSub.subscribe("update", (msg, data) => {
            this.updateScreen();
        });
    }

    createItemContent(item) {
        const div = document.createElement("div");
        div.className = "item";
        div.id = item.id;
        div.innerHTML = `<div class="top-row">
                            <div class="title">${item.title}</div>
                            <button class="item-button duplicate-item">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                            </button>
                            <button class="item-button edit-item">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                            </button>
                        </div>
                        <div class="description">${item.description}</div>
                    
                        <div class="bottom-row">
                            <div class="date">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                                ${format(item.dueDate, "dd/MM/yyyy")}
                            </div>
                            <div class="priority">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M480-120q-33 0-56.5-23.5T400-200q0-33 23.5-56.5T480-280q33 0 56.5 23.5T560-200q0 33-23.5 56.5T480-120Zm-80-240v-480h160v480H400Z"/></svg>
                                ${item.priority}
                            </div>
                        </div>`;

        const edit_button = div.querySelector(".edit-item");
        edit_button.addEventListener("click", (e) => {
            this.edit_item_hidden.value = item.id;
            this.edit_item_title.value = item.title;
            this.edit_item_description.value = item.description;
            this.edit_item_date.valueAsDate = item.dueDate;
            this.edit_item_priority.value = item.priority;
            this.edit_item_dialog.showModal();
        });
        const duplicate_button = div.querySelector(".duplicate-item");
        duplicate_button.addEventListener("click", (e) => {
            div.setAttribute("duplicated", "");
            setTimeout(() => {PubSub.publish("duplicate-item", item.id)}, 200);  
        });

        const div_checkbox_container = document.createElement("div");
        div_checkbox_container.className = "checkbox-container";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "checkbox-input-complete";

        input.addEventListener("change", e => {
            div.setAttribute("deleted", "");
            setTimeout(() => {PubSub.publish("delete-item", item.id)}, 250);
        });

        div_checkbox_container.appendChild(input);
        div.prepend(div_checkbox_container);
        return div;
    }

    createProjectViewNav(project) {
        const div = document.createElement("div");
        div.className = "btn-like";
        div.id = project.id;
        div.tabIndex = 0;

        div.addEventListener("click", (e) => {
            PubSub.publish("select", project.id);
        });

        div.innerHTML = `${project.svg}${project.title}`;
        return div;
    }

    createProjectViewContent(project) {
        const items = project.getItems();
        const div = document.createElement("div");
        div.className = "items-wrapper";
        items.forEach(item => {
            div.appendChild(this.createItemContent(item));
        });
        return div;
    }

    createProjectNav(project) {
        const div = document.createElement("div");
        div.className = "btn-like project";
        div.id = project.id;
        div.tabIndex = 0;

        div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m240-160 40-160H120l20-80h160l40-160H180l20-80h160l40-160h80l-40 160h160l40-160h80l-40 160h160l-20 80H660l-40 160h160l-20 80H600l-40 160h-80l40-160H360l-40 160h-80Zm140-240h160l40-160H420l-40 160Z"/></svg>
                        <input type="text" name="project-nav-title" class="input-project-title" value="${project.title}" disabled>`;
        const title_input = div.querySelector(".input-project-title");
        title_input.addEventListener("click", e => {
            e.stopPropagation();
        });
        title_input.addEventListener("keydown", ({key}) => {
            if (key === "Enter") {
                    PubSub.publish("edit-project", JSON.stringify({
                    project: project.id,
                    new_title: title_input.value,
                }));
                title_input.disabled = true;
            }
        });
        title_input.addEventListener("blur", e => {
            PubSub.publish("edit-project", JSON.stringify({
                project: project.id,
                new_title: title_input.value,
            }));
            title_input.disabled = true;
        });

        const project_settings_div = document.createElement("div");
        project_settings_div.className = "project-settings";
        project_settings_div.innerHTML = `
            <button type="button" class="project-settings-button" tabindex="0"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"></path></svg></button>
            <dialog class="project-settings-dialog" closedby="any">
                <div class="dialog-content">
                    <button type="button" class="project-settings-rename">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                        Rename
                    </button>
                    <button type="button" class="project-settings-delete">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                        Delete
                    </button>
                </div>
            </dialog>`;

        const button = project_settings_div.querySelector(".project-settings-button");
        const dialog = project_settings_div.querySelector(".project-settings-dialog");
        const button_delete = dialog.querySelector(".project-settings-delete");
        const button_rename = dialog.querySelector(".project-settings-rename");
        button.addEventListener("click", (e) => {
            dialog.show();
        });
        project_settings_div.addEventListener("click", e => {
            e.stopPropagation();
        });
        button_delete.addEventListener("click", (e) => {
            PubSub.publish("delete-project", project.id);
        });
        button_rename.addEventListener("click", e => {
            dialog.close();
            title_input.disabled = false;
            title_input.focus();
        });

        div.appendChild(project_settings_div);

        div.addEventListener("click", (e) => {
            PubSub.publish("select", project.id);
        });

        return div;
    } 

    createProjectContent(project) {
        const div = document.createElement("div");
        div.className = "items-wrapper";
        const items = project.getItems();

        items.forEach(item => {
            div.appendChild(this.createItemContent(item));
        });

        return div;
    }

    createActiveFilter(filter) {
        const div = document.createElement("div");
        div.className = "active-filter";
        div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M440-160q-17 0-28.5-11.5T400-200v-240L168-736q-15-20-4.5-42t36.5-22h560q26 0 36.5 22t-4.5 42L560-440v240q0 17-11.5 28.5T520-160h-80Zm40-308 198-252H282l198 252Zm0 0Z"/></svg>
                        <div class="active-filter-field">${filter.field}</div>
                        <div class="active-filter-operator">${filter.operator}</div>
                        <div class="active-filter-value">${filter.value_as_string}</div>
                        <button class="active-filter-delete">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                        </button>`;
        const button_delete = div.querySelector(".active-filter-delete");
        button_delete.addEventListener("click", (e) => {
            PubSub.publish("delete-filter", filter.id);
        }); 
        return div;
    }

    updateScreen() {
        // header
        this.dom_header.textContent = list.selected_project.title;

        // navigation projects
        this.dom_projects.innerHTML = "";
        for (let i = 0; i < list.projects.length; i++) {
            let project_element = null;
            if (list.projects[i] instanceof ToDoProjectView) 
                project_element = this.createProjectViewNav(list.projects[i]);
            else 
                project_element = this.createProjectNav(list.projects[i]);
 
            if (list.projects[i] == list.selected_project) {
                project_element.setAttribute("selectedproject", "");
            }
            else {
                project_element.removeAttribute("selectedproject");
            }
            this.dom_projects.appendChild(project_element);
        }

        // items in the main part
        this.dom_items.innerHTML = "";
        if (list.selected_project instanceof ToDoProjectView) 
            this.dom_items.appendChild(this.createProjectViewContent(list.selected_project));
        else 
            this.dom_items.appendChild(this.createProjectContent(list.selected_project));

        // project option inside the modal
        this.dom_add_item_projects.innerHTML = "";

        if (list.selected_project instanceof ToDoProject) {
            const option = document.createElement("option");
            option.value = list.selected_project.id;
            option.textContent = list.selected_project.title;
            this.dom_add_item_projects.appendChild(option);
        }
        for (let i = 0; i < list.projects.length; i++) {
            if (list.projects[i] instanceof ToDoProject && list.projects[i] != list.selected_project) {
                const option = document.createElement("option");
                option.value = list.projects[i].id;
                option.textContent = list.projects[i].title;
                this.dom_add_item_projects.appendChild(option);
            }
        }

        // active filters
        const active_fitlers_div = document.getElementById("active-filters");
        active_fitlers_div.innerHTML = "";
        list.selected_project.filters.forEach(filter => {
            const div = this.createActiveFilter(filter);
            active_fitlers_div.appendChild(div);
        });
    }
}