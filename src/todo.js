import { format } from "date-fns";

export let id_to_item = {};
export let id_to_project = {};

export class ToDoItem {
    constructor(title, description, dueDate, priority) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.description = description;
        this.dueDate = new Date(format(dueDate, "yyyy-MM-dd"));
        this.priority = priority;
        this.parent_project = null;

        id_to_item[this.id] = this;
    }

    convertToSaveable() {
        let obj = {};
        obj.title = this.title;
        obj.description = this.description;
        obj.dueDate = this.dueDate;
        obj.priority = this.priority;
        return obj;
    }
}

export class Filter {
    constructor(field, operator, value, value_as_string) {
        const field_to_first_value = {
            "title": a => a.title.toLowerCase(),
            "date": a => a.dueDate,
            "priority": a => a.priority,
        }
        const field_to_second_value = {
            "title": () => value.toLowerCase(),
            "date": () => value,
            "priority": () => value,
        }
        const second_value = field_to_second_value[field]();
        const string_to_operator = {
            "<" : a => field_to_first_value[field](a) < second_value,
            ">" : a => field_to_first_value[field](a) > second_value,
            "<=" : a => field_to_first_value[field](a) <= second_value,
            ">=" : a => field_to_first_value[field](a) >= second_value,
            "=" : a => field_to_first_value[field](a) == second_value,
            "!=" : a => field_to_first_value[field](a) != second_value,
        };

        this.field = field;
        this.operator = operator;
        this.value = value;
        this.value_as_string = value_as_string;
        this.id = crypto.randomUUID();
        this.comparator = string_to_operator[operator];
    }
}

export class Sort {
    constructor(field, direction) {
        this.field = field;
        this.direction = direction;
        const compare = direction === "asc" ? (a, b) => {return a > b ? 1 : -1;} : (a, b) => {return a < b ? 1 : -1};
        this.comparator = null;
        if (field === "title")
            this.comparator = (a, b) => compare(a.title.toLowerCase(), b.title.toLowerCase());
        if (field === "date")
            this.comparator = (a, b) => compare(a.dueDate, b.dueDate);
        if (field === "priority")
            this.comparator = (a, b) => compare(a.priority, b.priority);
    }
}

export class ToDoProject {
    constructor(title) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.items = [];
        
        this.sort = null;
        this.filters = [];
        id_to_project[this.id] = this;
    }

    getItems() {
        let items_copy = [...this.items];
        for (let i = 0; i < this.filters.length; i++)
            items_copy = items_copy.filter(this.filters[i].comparator);
        if (this.sort !== null)
            items_copy.sort(this.sort.comparator);
        return items_copy;
    }

    addItem(item) {
        this.items.push(item);
        item.parent_project = this;
    }

    addItemAt(item, index) {
        this.items.splice(index, 0, item);
        item.parent_project = this;
    }

    deleteItem(item_id) {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id == item_id) {
                this.items.splice(i, 1);
                break;
            }
        }
    }

    convertToSaveable() {
        let obj = {};
        obj.title = this.title;
        obj.items = [];
        for (let i = 0; i < this.items.length; i++) {
            obj.items.push(this.items[i].convertToSaveable());
        }
        return obj;
    }
}

export class ToDoProjectView {
    constructor(title, svg, getItemsNoFilter) {
        this.id = crypto.randomUUID();
        this.title = title;
        
        this.sort = null;
        this.filters = [];

        this.svg = svg;
        this.getItems = () => {
            let items = getItemsNoFilter();
            for (let i = 0; i < this.filters.length; i++)
                items = items.filter(this.filters[i].comparator);
            if (this.sort !== null)
                items.sort(this.sort.comparator);
            return items;
        };
    }
}

export class ToDoList {
    constructor() {
        this.projects = [];
        this.selected_project = null;
    }

    addProject(project) {
        this.projects.push(project);
    }

    deleteProject(project_id) {
        for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].id == project_id) {
                if (this.selected_project == this.projects[i]) {
                    this.selected_project = (i + 1 < this.projects.length ? this.projects[i + 1] : this.projects[i - 1]);
                }
                this.projects.splice(i, 1);
                break;
            }
        }
    }

    convertToSaveable() {
        let projects = [];
        for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i] instanceof ToDoProject)
                projects.push(this.projects[i].convertToSaveable());
        }
        return projects;
    }
}

export let list = new ToDoList();