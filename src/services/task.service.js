const taskRepository = require('../repositories/task.repository');
const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { TASK_MESSAGES } = require('../constants/messages');

const TASK_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const TASK_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'COMPLETED']);

const assertActor = (actor) => {
  if (!actor) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }
};

const assertTaskPriority = (priority) => {
  if (!TASK_PRIORITIES.has(priority)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task priority');
  }
};

const assertTaskStatus = (status) => {
  if (!TASK_STATUSES.has(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid task status');
  }
};

const assertDueDate = (dueDate) => {
  if (!(dueDate instanceof Date) || Number.isNaN(dueDate.getTime())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Valid due date is required');
  }
};

const getManagerAssignableIds = async (employeeId) => {
  const subordinates = await employeeRepository.getSubordinates(employeeId);
  return [employeeId, ...subordinates.map((employee) => employee.id)];
};

const assertCanAssignTask = async (actor, assignedToId) => {
  if (['SUPER_ADMIN', 'HR_ADMIN'].includes(actor.role)) {
    return 'HR';
  }

  if (actor.role !== 'MANAGER' || !actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: task assignment not allowed');
  }

  const allowedIds = await getManagerAssignableIds(actor.employeeId);
  if (!allowedIds.includes(assignedToId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
  }

  return 'MANAGER';
};

const createTask = async (payload, actor) => {
  assertActor(actor);

  if (!payload?.title || !payload?.description || !payload?.assignedToId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Title, description, and assignee are required');
  }

  assertDueDate(payload.dueDate);
  assertTaskPriority(payload.priority);

  const assignee = await employeeRepository.getEmployeeById(payload.assignedToId);
  if (!assignee) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assignee not found');
  }

  const assignedByRole = await assertCanAssignTask(actor, payload.assignedToId);

  return taskRepository.createTask({
    title: payload.title,
    description: payload.description,
    assignedToId: payload.assignedToId,
    createdByUserId: actor.userId,
    assignedByRole,
    dueDate: payload.dueDate,
    priority: payload.priority,
  });
};

const listTasks = async (filters = {}, actor) => {
  assertActor(actor);

  const scopedFilters = { ...filters };

  if (scopedFilters.priority) {
    assertTaskPriority(scopedFilters.priority);
  }

  if (scopedFilters.status) {
    assertTaskStatus(scopedFilters.status);
  }

  if (['SUPER_ADMIN', 'HR_ADMIN'].includes(actor.role)) {
    return taskRepository.listTasks(scopedFilters);
  }

  if (!actor.employeeId) {
    return [];
  }

  if (actor.role === 'MANAGER') {
    const allowedIds = await getManagerAssignableIds(actor.employeeId);

    if (scopedFilters.assignedToId && !allowedIds.includes(scopedFilters.assignedToId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
    }

    scopedFilters.assignedToId = scopedFilters.assignedToId
      ? scopedFilters.assignedToId
      : { in: allowedIds };

    return taskRepository.listTasks(scopedFilters);
  }

  if (scopedFilters.assignedToId && scopedFilters.assignedToId !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }

  scopedFilters.assignedToId = actor.employeeId;
  return taskRepository.listTasks(scopedFilters);
};

const updateTaskStatus = async (id, status, actor) => {
  assertActor(actor);
  assertTaskStatus(status);

  const task = await taskRepository.getTaskById(id);
  if (!task) {
    throw new ApiError(StatusCodes.NOT_FOUND, TASK_MESSAGES.NOT_FOUND);
  }

  if (!actor.employeeId || task.assignedToId !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: only the assignee can update task status');
  }

  return taskRepository.updateTask(id, { status });
};

module.exports = {
  createTask,
  listTasks,
  updateTaskStatus,
};