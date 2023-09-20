const Joi = require("joi");
const Job = require("../model/jobsModel");
const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler");

// Get a single job

const getJob = asyncHandler(async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }

  const job = await Job.findById(id);
  if (!job)
    return res.status(404).send("the job with the given id was not found.");

  res.status(200).json(job);
});

// Get all jobs

const getJobs = asyncHandler(async (req, res) => {
  // let{page, limit, sort, ...filter} = req.body;
    // filter variables
    const jobTitleFilter = req.query.jobTitleFilter;
    const companyNameFilter = req.query.companyNameFilter;
    const jobLocationFilter = req.query.jobLocationFilter; 
    // sort variables
    const jobTitleSort = req.query.jobTitleSort;
    const companyNameSort = req.query.companyNameSort;
    const jobLocationSort = req.query.jobLocationSort;
    // Pagination 
    const pageNumber = parseInt(req.query.pageNumber, 10);
    const pageLimit = parseInt(req.query.pageLimit, 10);

    let filter = {};
    if(jobTitleFilter) filter.position = jobTitleFilter;
    if(companyNameFilter) filter.company = companyNameFilter;
    if(jobLocationFilter) filter.location = jobLocationFilter;

    let sort = {};
    if(jobTitleSort) sort.position = jobTitleSort === 'desc' ? -1 : 1;
    if(companyNameSort) sort.company = companyNameSort === 'desc' ? -1 : 1;
    if(jobLocationSort) sort.location = jobLocationSort === 'desc' ? -1 : 1;
    

    const jobs = await Job
    .find(filter)
    .sort(sort)
    .skip((pageNumber -1)*pageLimit)
    .limit(pageLimit);

    // Get the total number of jobs that match the filter
    const count = await Job.countDocuments(filter);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / pageLimit);
    
    res.status(200).json({
      jobs,
      totalPages,
      currentPage: pageNumber
    });
    
});

// Post a single job

const postJob = asyncHandler(async (req, res) => {

  const { error } = validateJob(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const job = await Job.create({
    user: req.user.id,
    company: req.body.company,
    logo: req.body.logo,
    isnew: req.body.isTrue,
    featured: req.body.featured,
    position: req.body.position,
    role: req.body.role,
    level: req.body.level,
    contract: req.body.contract,
    location: req.body.location,
    languages: req.body.languages,
    tools: req.body.tools,
  });

  res.status(200).json(job);
});

// Update a single job

const patchJob = asyncHandler(async (req, res) => {

  const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Job ID" });
      }

      const { error } = validateJobPatch(req.body);

      if (error) return res.status(400).send(error.details[0].message);

  const job =  await Job.findByIdAndUpdate(id, req.body,{
    new:true,
    runValidators: true
  });

  if (!job)
    return res.status(404).send("the job with the given id was not found."); 

  res.status(200).json(job);
});

// Delete a single job

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job)
    return res.status(404).send("the job with the given id was not found.");

await Job.findByIdAndRemove(req.params.id);

  res.status(200).json({ message: `Delete job ${req.params.id}` });
});

// JOI VALIDATOR POST

const validateJob = (job) => {
  const schema = Joi.object({
    company: Joi.string().min(3).required(),
    logo: Joi.string().required(),
    isnew: Joi.boolean().required(),
    featured: Joi.boolean().required(),
    position: Joi.string().required(),
    role: Joi.string().required(),
    level: Joi.string().required(),
    contract: Joi.string().required(),
    location: Joi.required(),
    languages: Joi.array().required(),
    tools: Joi.array().required(),
  });

  return schema.validate(job);
};

// JOI VALIDATOR POST

const validateJobPatch = (job) => {
  const schema = Joi.object({
    company: Joi.string().min(3).optional(),
    logo: Joi.string().optional(),
    isnew: Joi.boolean().optional(),
    featured: Joi.boolean().optional(),
    position: Joi.string().optional(),
    role: Joi.string().optional(),
    level: Joi.string().optional(),
    contract: Joi.string().optional(),
    location: Joi.optional(),
    languages: Joi.array().optional(),
    tools: Joi.array().optional(),
  });

  return schema.validate(job);
};

module.exports = {
  getJob,
  getJobs,
  postJob,
  patchJob,
  deleteJob,
};
 