const taskService = require('../services/task.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { TASK_MESSAGES } = require('../constants/messages');
const { CreateTaskDTO, UpdateTaskStatusDTO, TaskFilterDTO } = require('../dtos/task.dto');

const createTask = async (req, res, next) => {
  try {
    const dto = new CreateTaskDTO(req.body);
    const task = await taskService.createTask(dto, req.user);
    return sendSuccess(res, TASK_MESSAGES.CREATE_SUCCESS, task, StatusCodes.CREATED);
  } catch (err) {
    return next(err);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const filterDto = new TaskFilterDTO(req.query);
    const tasks = await taskService.listTasks(filterDto, req.user);
    return sendSuccess(res, TASK_MESSAGES.FETCH_ALL_SUCCESS, tasks, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const dto = new UpdateTaskStatusDTO(req.body);
    const task = await taskService.updateTaskStatus(req.params.id, dto.status, req.user);
    return sendSuccess(res, TASK_MESSAGES.STATUS_UPDATE_SUCCESS, task, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createTask,
  listTasks,
  updateTaskStatus,
};