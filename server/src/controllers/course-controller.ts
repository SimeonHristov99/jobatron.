import { Request, Response } from 'express';
import { Course } from '../models/course';
import ICourse from '../models/interfaces/ICourse';
import course from '../routes/course';

export default class CourseController {
  construct() { }

  listCourses = async (req: Request, res: Response) => {
    const courses = await Course.aggregate([{
      $addFields: {
        "usersEnrolled": {
          $size: "$usersEnrolled"
        }
      }
    },
    {
      $unset: "__v"
    }
    ]);

    res.status(200).json(courses);
  }

  getEnrolledUsers =  async (req: Request, res: Response) => {
    Course.findOne({_id: req.body.id}).select('usersEnrolled')
    .then(course  => {res.status(200).json(course)})
    .catch(err => {res.status(500).json({ success: false, error: 'Can not get enrolled users in course: ' + err })});
  }

  sortCoursesByPrice = async (req: Request, res: Response) => {
    Course.aggregate([{
      $addFields: {
        "usersEnrolled": {
          $size: "$usersEnrolled"
        }
      }
    },
    {
      $unset: "__v"
    }
    ]).sort({price: 1})
    .then(course  => {res.status(200).json(course)})
    .catch(err => {res.status(500).json({ success: false, error: 'Can not get courses: ' + err })});
  }

  sortCoursesByLevel = async (req: Request, res: Response) => {
    Course.aggregate([{
      $addFields: {
        "usersEnrolled": {
          $size: "$usersEnrolled"
        },
        "priority": {
          $switch: {
            branches: [
              { 
                case: {$eq: ["$level", "beginner"]},
                then: 1
              },
              { 
                case: {$eq: ["$level", "intermediate"]},
                then: 2
              },
              {
                case: {$eq: ["$level", "advanced"]},
                then: 3
              }
            ],
            default: -1
          }
        }
      }
    },
    {
      $unset: "__v"
    }
    ]).sort({priority: 1})
    .then(course  => {res.status(200).json(course)})
    .catch(err => {res.status(500).json({ success: false, error: 'Can not get courses: ' + err })});
  }

  sortCoursesByRating = async (req: Request, res: Response) => {
    Course.aggregate([{
      $addFields: {
        "usersEnrolled": {
          $size: "$usersEnrolled"
        }
      }
    },
    {
      $unset: "__v"
    }
    ]).sort({rating: 1})
    .then(course  => {res.status(200).json(course)})
    .catch(err => {res.status(500).json({ success: false, error: 'Can not get courses: ' + err })});
  }

  searchCoursesByName = async (req: Request, res: Response) => {
    const searchName = req.body.name;
    Course.find({title: {$regex: `${searchName}`, $options: "i"}})
    .then(course  => {res.status(200).json(course)})
    .catch(err => {res.status(500).json({ success: false, error: 'Can not get courses: ' + err })});
  }

  createCourse = async (req: Request, res: Response) => {
    let course: ICourse = req.body;
    console.log(course);
    course.createdBy = res.locals.user.id;

    const newCourse = new Course(course);

    newCourse.save((err: Error, _) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Can not create course because' + err });
      }
      res.status(200).json({ success: true });
    });
  };

  updateCourse = async (req: Request, res: Response) => {
    const course: ICourse = req.body;

    Course.findOneAndUpdate( {_id: course._id}, course, {new: true}, function(err, data) {
      if(err){
        return res.status(500);
     } else {
        return res.status(200).send(data);
     }
    });

  };

  deleteCourse = async (req: Request, res: Response, next: () => void) => {
    const course_id = req.body.id;
    console.log(course_id);
    try {
      const course = await Course.findOne({_id: course_id}).exec();

      if (course) {
        course.remove((err: Error, _) => {
          if (err) {
            console.log(err);
            res.status(401).json({ success: false, error: err });
          }
          res.status(200).json({ success: true });
        });
      } else {
        res.status(401).json({ success: false, error: 'Invalid course id' });
      }
    } catch (error) {
      res.status(401).json({ success: false, error: 'Invalid course id' });
    }
  };
}