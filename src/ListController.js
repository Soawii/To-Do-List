import { ToDoItem, ToDoList, ToDoProject, ToDoProjectView, list, id_to_item, id_to_project, Filter, Sort} from "./todo";
import PubSub from 'pubsub-js';
import { format } from "date-fns";

export default class ListController {
    constructor() {
        const projectAll = new ToDoProjectView("All items", `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-280h160v-160H280v160Zm240 0h160v-160H520v160ZM280-520h160v-160H280v160Zm240 0h160v-160H520v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>`, () => {
            const items = [];
            list.projects.forEach(project => {
                if (project instanceof ToDoProject) {
                    project.items.forEach(item => {
                        items.push(item);
                    }); 
                }
            })
            return items;
        });
        const projectToday = new ToDoProjectView("Today", `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M360-300q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/></svg>`, () => {
            const items = [];
            const today = new Date();
            list.projects.forEach(project => {
                if (project instanceof ToDoProject) {
                    project.items.forEach(item => {
                        if (item.dueDate.getDate() == today.getDate() && 
                                item.dueDate.getMonth() == today.getMonth() &&
                                item.dueDate.getFullYear() == today.getFullYear()) {
                            items.push(item);
                        }
                    }); 
                }
            })
            return items;
        });
        const projectUpcoming = new ToDoProjectView("Upcoming", `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>`, () => {
            const items = [];
            const today = new Date(format(new Date(), "yyyy-MM-dd"));
            list.projects.forEach(project => {
                if (project instanceof ToDoProject) {
                    project.items.forEach(item => {
                        if (item.dueDate > today) {
                            items.push(item);
                        }
                    }); 
                }
            })
            return items;
        });
        const projectPast = new ToDoProjectView("Past", `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-640h560v-80H200v80Zm0 0v-80 80Zm0 560q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v227q-19-9-39-15t-41-9v-43H200v400h252q7 22 16.5 42T491-80H200Zm520 40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm67-105 28-28-75-75v-112h-40v128l87 87Z"/></svg>`, () => {
            const items = [];
            const today = new Date(format(new Date(), "yyyy-MM-dd"));
            list.projects.forEach(project => {
                if (project instanceof ToDoProject) {
                    project.items.forEach(item => {
                        if (item.dueDate < today) {
                            items.push(item);
                        }
                    }); 
                }
            })
            return items;
        });
        this.addProject(projectAll);
        this.addProject(projectToday);
        this.addProject(projectUpcoming);
        this.addProject(projectPast);
        this.setSort(projectUpcoming, "date", "asc");
        this.setSort(projectPast, "date", "desc");
        
        PubSub.subscribe("select", (msg, data) => {
            for (let i = 0; i < list.projects.length; i++) {
                if (list.projects[i].id == data) {
                    this.selectProject(list.projects[i]);
                    break;
                }
            }
        });

        PubSub.subscribe("delete-item", (msg, data) => {
            this.deleteItem(data);
        });
        PubSub.subscribe("delete-project", (msg, data) => {
            this.deleteProject(data);
        });
        PubSub.subscribe("delete-filter", (msg, data) => {
            this.deleteFilter(data);
        });

        PubSub.subscribe("new-item", (msg, data) => {
            const new_item = JSON.parse(data);
            this.addItemWithArguments(new_item.title,
                new_item.description, 
                new Date(new_item.date),
                Number(new_item.priority), 
                id_to_project[new_item.project])
        });

        PubSub.subscribe("edit-item", (msg, data) => {
            const new_item = JSON.parse(data);
            this.editItem(id_to_item[new_item.item], new_item.title, new_item.description, new Date(new_item.date), Number(new_item.priority));
        });
        PubSub.subscribe("edit-project", (msg, data) => {
            const new_project = JSON.parse(data);
            this.editProject(id_to_project[new_project.project], new_project.new_title);
        });

        PubSub.subscribe("add-project", (msg, data) => {
            const new_project_title = data;
            this.addProject(new ToDoProject(new_project_title));
        });

        PubSub.subscribe("sort", (msg, data) => {
            const data_obj = JSON.parse(data);
            this.setSort(list.selected_project, data_obj.field, data_obj.direction);
        });

        PubSub.subscribe("filter", (msg, data) => {
            const data_obj = JSON.parse(data);
            this.addFilter(list.selected_project, data_obj.field, data_obj.operator, data_obj.values);
        });

        PubSub.subscribe("duplicate-item", (msg, data) => {
            this.duplicateItem(data);
        });
    }   

    loadDefault() {
        const today = new Date();
        const week_from_now = new Date();
        week_from_now.setDate(today.getDate() + 7);
        const two_weeks_from_now = new Date();
        two_weeks_from_now.setDate(today.getDate() + 30);
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const project_uni = new ToDoProject("University");
        const item_linalg = new ToDoItem("Linear Algebra", "Finish the homework", week_from_now, 2);
        const item_dsa = new ToDoItem("Data Structures and Algorithms", "Send in the final assignment", two_weeks_from_now, 3);
        const item_calc = new ToDoItem("Calculus", "Read pages 207-231", yesterday, 1);

        const project_home = new ToDoProject("Home");
        const item_dishes = new ToDoItem("Dishes", "Do the dishes", today, 1);
        const item_walk = new ToDoItem("Walk the dog", "Go to the store after", today, 2);
        const item_clean = new ToDoItem("Cleaning", "Clean the house", today, 2);

        this.addProject(project_uni);
        this.addProject(project_home);
        this.addItem(item_linalg, project_uni);
        this.addItem(item_dsa, project_uni);
        this.addItem(item_calc, project_uni);
        this.addItem(item_dishes, project_home);
        this.addItem(item_walk, project_home);
        this.addItem(item_clean, project_home);
    }

    loadStorage(storage_obj) {
        storage_obj.forEach(project => {
            const new_project = new ToDoProject(project.title);
            list.addProject(new_project);
            project.items.forEach(item => {
                new_project.addItem(new ToDoItem(item.title, item.description, item.dueDate, item.priority));
            });
        });
        if (list.projects.length > 0)
            this.selectProject(list.projects[0]);
    }   

    addItemWithArguments(title, description, dueDate, priority, project) {
        this.addItem(new ToDoItem(title, description, new Date(format(dueDate, "yyyy-MM-dd")), priority), project);
    }

    addItem(item, project) {
        project.addItem(item);
        this.selectProject(project);
    }

    addItems(items, project) {
        items.forEach(item => {
            project.addItem(item);
        });
        this.selectProject(project);
    }


    addProject(project) {
        list.addProject(project);
        this.selectProject(project);
    }
    
    selectProject(project) {
        list.selected_project = project;
        PubSub.publish("update", "select");
    }

    duplicateItem(item_id) {
        const item = id_to_item[item_id];
        for (let i = 0; i < item.parent_project.items.length; i++) {
            if (item.parent_project.items[i].id == item_id) {
                item.parent_project.addItemAt(new ToDoItem(item.title, item.description, item.dueDate, item.priority), i + 1);
                break;
            }
        }
        PubSub.publish("update", "duplicate");
    }

    deleteItem(item_id) {
        id_to_item[item_id].parent_project.deleteItem(item_id);
        PubSub.publish("update", "delete");
    }   

    deleteProject(project_id) {
        list.deleteProject(project_id);
        PubSub.publish("update", "delete");
    }

    deleteFilter(filter_id) {
        for (let i = 0; i < list.selected_project.filters.length; i++) {
            if (list.selected_project.filters[i].id == filter_id) {
                list.selected_project.filters.splice(i, 1);
                break;
            }
        }
        PubSub.publish("update", "delete");
    }

    editItem(item, new_title, new_description, new_date, new_priority) {
        item.title = new_title;
        item.description = new_description;
        item.dueDate = new_date;
        item.priority = new_priority;
        PubSub.publish("update", "edit");
    }

    editProject(project, new_title) {
        project.title = new_title;
        PubSub.publish("update", "edit");
    }

    setSort(project, field, direction) {
        project.sort = new Sort(field, direction);
        PubSub.publish("update", "sort");
    }

    addFilter(project, field, operator, values) {
        if (field == "")
            return;
        const field_to_value = {
            "title": values.text,
            "date": new Date(values.date),
            "priority": Number(values.number),
        }
        const field_to_value_string = {
            "title": values.text,
            "date": format(new Date(values.date), "dd-MM-yyyy"),
            "priority": Number(values.number),
        }
        project.filters.push(new Filter(field, operator, field_to_value[field], field_to_value_string[field]));
        PubSub.publish("update", "filter");
    }
}