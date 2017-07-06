//Config for gulp
config            = require("./config/gulp");

//Utilities
function nameToTask(name){
  return "./gulp/"+name+".js";
}

function flatten(target,source)
{
    source = source || [];
    return [].concat.apply(source,target);
}

function unnest(task)
{
    if (config.tasklist[task])
    {
      expanded.push(task);
      return flatten(config.tasklist[task].map(unnest))
    }
    return task
}

function flog(msg,color)
{
  color = color || "green";
  util.log(util.colors[color](msg))
}

//Dependencies
var gulp          = require("gulp"),
    util          = require("gulp-util"),
    HubRegistry   = require('gulp-hub'),
    env           = util.env._.length > 0 ? util.env._ : ["default"],
    expanded      = [],
    tasks         = flatten(env.map(unnest)),
    tasklist      = (tasks||["*"]).map(nameToTask);

flog("========FLUX TASK LOADER========")
/* load some gulpfiles into the registry */
var hub = HubRegistry(tasklist);

/* tell gulp to use the tasks just loaded */
gulp.registry(hub);

flog("=======FLUX TASKSET LOADER======")
/* Load all tasks from config (if required)*/
for (var task in config.tasklist)
  if (tasks.includes(task)    ||
      env.includes(task)      ||
      expanded.includes(task) ||
      env.length <= 0         )
      {
    gulp.task(task,gulp.series(config.tasklist[task]))
    flog("Loaded: \t\t"+util.colors.cyan(task))
  }

flog("============TASKLIST============")
flog(tasks.join("\t"),'cyan')

flog("===========GULP START===========")
