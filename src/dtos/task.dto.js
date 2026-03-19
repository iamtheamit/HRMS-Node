const BaseDTO = require('./base.dto');

class CreateTaskDTO extends BaseDTO {
  constructor(data) {
    super(data, ['title', 'description', 'assignedToId', 'dueDate', 'priority']);

    if (this.dueDate) {
      this.dueDate = new Date(this.dueDate);
    }
  }
}

class UpdateTaskStatusDTO extends BaseDTO {
  constructor(data) {
    super(data, ['status']);
  }
}

class TaskFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['assignedToId', 'status', 'priority']);
  }
}

module.exports = {
  CreateTaskDTO,
  UpdateTaskStatusDTO,
  TaskFilterDTO,
};