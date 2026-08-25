import express from 'express';
import {
  getAdminStats,
  getAdminRecentTrips,
  getAdminUsers,
  getAdminActivityFeed,
  getAdminNotifications
} from '../controllers/adminController.js';
import {
  getAdminAllTrips,
  toggleTripFeaturedAdmin,
  toggleTripVisibilityAdmin,
  deleteTripAdmin
} from '../controllers/adminTripsController.js';
import {
  getAdminAllUsers,
  createAdminUser,
  updateAdminUserDetails,
  updateUserRoleAdmin,
  toggleUserStatusAdmin,
  deleteUserAdmin
} from '../controllers/adminUsersController.js';
import {
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  deleteAdminCustomer
} from '../controllers/adminCustomersController.js';
import {
  getAdminEmployees,
  createAdminEmployee,
  updateAdminEmployee,
  deleteAdminEmployee
} from '../controllers/adminEmployeesController.js';
import {
  getAdminEmployeeTasks,
  createAdminEmployeeTask,
  updateAdminEmployeeTaskStatus,
  deleteAdminEmployeeTask
} from '../controllers/adminEmployeeTasksController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/trips', getAdminRecentTrips);
router.get('/users', getAdminUsers);
router.get('/activity', getAdminActivityFeed);
router.get('/notifications', getAdminNotifications);

router.get('/trips/all', getAdminAllTrips);
router.patch('/trips/:id/feature', toggleTripFeaturedAdmin);
router.patch('/trips/:id/visibility', toggleTripVisibilityAdmin);
router.delete('/trips/:id', deleteTripAdmin);

router.get('/users/all', getAdminAllUsers);
router.post('/users', createAdminUser);
router.put('/users/:id', updateAdminUserDetails);
router.patch('/users/:id/role', updateUserRoleAdmin);
router.patch('/users/:id/status', toggleUserStatusAdmin);
router.delete('/users/:id', deleteUserAdmin);

router.get('/customers', getAdminCustomers);
router.post('/customers', createAdminCustomer);
router.put('/customers/:id', updateAdminCustomer);
router.delete('/customers/:id', deleteAdminCustomer);

router.get('/employees', getAdminEmployees);
router.post('/employees', createAdminEmployee);
router.put('/employees/:id', updateAdminEmployee);
router.delete('/employees/:id', deleteAdminEmployee);

router.get('/employees/tasks', getAdminEmployeeTasks);
router.post('/employees/tasks', createAdminEmployeeTask);
router.patch('/employees/tasks/:id/status', updateAdminEmployeeTaskStatus);
router.delete('/employees/tasks/:id', deleteAdminEmployeeTask);

export default router;
