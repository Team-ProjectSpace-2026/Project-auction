import { body } from 'express-validator';

export const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('mobile')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateTournament = [
  body('name')
    .notEmpty()
    .withMessage('Tournament name is required')
    .isLength({ max: 100 })
    .withMessage('Tournament name cannot exceed 100 characters'),
  
  body('status')
    .isIn(['Active', 'Upcoming', 'Completed'])
    .withMessage('Status must be Active, Upcoming, or Completed'),
  
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  
  body('teams')
    .notEmpty()
    .withMessage('Number of teams is required'),
  
  body('venue')
    .notEmpty()
    .withMessage('Venue is required')
    .isLength({ max: 200 })
    .withMessage('Venue cannot exceed 200 characters'),

  body('budgetPerTeam')
    .isFloat({ min: 0 })
    .withMessage('Budget per team must be a positive number'),

  body('maxPlayersPerTeam')
    .isInt({ min: 1 })
    .withMessage('Maximum players per team must be at least 1'),

  body('playerBasePrice')
    .isFloat({ min: 0 })
    .withMessage('Player base price must be a positive number')
];

export const validateRegistrationDeadline = [
  body('registrationEndDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Registration end date must be a valid date')
];

export const validatePlayer = [
  body('name')
    .notEmpty()
    .withMessage('Player name is required')
    .isLength({ max: 50 })
    .withMessage('Player name cannot exceed 50 characters'),
  
  body('role')
    .isIn(['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'])
    .withMessage('Role must be Batsman, Bowler, All Rounder, or Wicket Keeper'),
  
  body('style')
    .optional({ values: 'falsy' })
    .isLength({ max: 100 })
    .withMessage('Playing style cannot exceed 100 characters'),
  
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),

  body('tournamentId')
    .notEmpty()
    .withMessage('Tournament ID is required')
    .isMongoId()
    .withMessage('Invalid Tournament ID format')
];

export const validateTeam = [
  body('name')
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ max: 50 })
    .withMessage('Team name cannot exceed 50 characters'),
  
  body('short')
    .notEmpty()
    .withMessage('Team abbreviation is required')
    .isLength({ min: 1, max: 3 })
    .withMessage('Team abbreviation must be 1-3 characters'),
  
  body('budget')
    .notEmpty()
    .withMessage('Budget is required')
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  
  body('totalBudget')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  
  body('maxPlayers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max players must be a positive integer'),

  body('tournamentId')
    .notEmpty()
    .withMessage('Tournament ID is required')
    .isMongoId()
    .withMessage('Invalid Tournament ID format'),

  body('ownerName')
    .notEmpty()
    .withMessage('Owner name is required')
    .isLength({ max: 100 })
    .withMessage('Owner name cannot exceed 100 characters'),

  body('logo')
    .optional()
    .isString()
    .withMessage('Logo must be a string')
    .isLength({ max: 5242880 })
    .withMessage('Logo cannot exceed 5MB')
];

export const validateBid = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Bid amount must be a strictly positive number'),
  
  body('teamId')
    .notEmpty()
    .withMessage('Team ID is required')
    .isMongoId()
    .withMessage('Invalid Team ID format')
];

export const validatePublicRegistration = [
  body('playerName')
    .notEmpty()
    .withMessage('Player name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Player name must be between 2 and 50 characters'),
  
  body('age')
    .isInt({ min: 10, max: 60 })
    .withMessage('Age must be between 10 and 60'),
  
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .isLength({ min: 7, max: 15 })
    .withMessage('Enter a valid mobile number'),
  
  body('primaryRole')
    .isIn(['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'])
    .withMessage('Role must be Batsman, Bowler, All Rounder, or Wicket Keeper'),
  
  body('battingStyle')
    .optional({ values: 'falsy' })
    .isIn(['Right Hand', 'Left Hand'])
    .withMessage('Batting style must be Right Hand or Left Hand'),
  
  body('bowlingStyle')
    .optional({ values: 'falsy' })
    .isIn([
      'Right Arm Fast', 'Right Arm Medium', 'Right Arm Spin',
      'Left Arm Fast', 'Left Arm Medium', 'Left Arm Spin',
      'Not Applicable', ''
    ])
    .withMessage('Invalid bowling style'),

  body('countryCode')
    .optional()
    .isIn(['+91', '+1', '+44', '+61', '+971', '+65'])
    .withMessage('Invalid country code'),

  body('isKeeper')
    .optional({ values: 'falsy' })
    .isIn(['Yes', 'No'])
    .withMessage('isKeeper must be Yes or No'),

  body('isAllRounder')
    .optional({ values: 'falsy' })
    .isIn(['Yes', 'No'])
    .withMessage('isAllRounder must be Yes or No'),
];