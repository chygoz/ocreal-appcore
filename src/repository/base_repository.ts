import {
  Model,
  Document,
  UpdateQuery,
  FilterQuery,
  QueryOptions,
  Types,
} from 'mongoose';
import { any_object } from '../@types/types';

class BaseRepo<T extends Document> {
  protected constructor(private model: Model<T>) {}

  async insert(data: any) {
    return (await this.model.create(data)).toObject();
  }

  async insertOne(data: any) {
    return await this.model.create(data);
  }

  async insertMany(data: Array<any>) {
    return await this.model.insertMany(data);
  }

  async findByIdAndUpdate(
    id: string,
    updateQuery: UpdateQuery<T>,
    options?: QueryOptions,
    populate: any_object = {},
  ) {
    return await this.model
      .findByIdAndUpdate(id.toString(), updateQuery, {
        ...options,
        new: true,
        ...populate,
      })
      .lean()
      .exec();
  }
  async findById(
    id: string | Types.ObjectId,
    options: QueryOptions | any_object = {},
  ) {
    return await this.model.findById(id, {}, options).lean().exec();
  }

  async findOne(
    query: FilterQuery<T>,
    options: QueryOptions | any_object = {},
  ) {
    return await this.model.findOne(query, null, options).lean().exec();
  }

  async find(query: FilterQuery<T>, options: QueryOptions) {
    return await this.model
      .find(query, null, { sort: { createdAt: -1 }, ...options })
      .lean()
      .exec();
  }

  async search(query: any, options: QueryOptions) {
    return await this.model
      .find(query, null, { sort: { createdAt: -1 }, ...options })
      .lean()
      .exec();
  }

  async count(query: any) {
    return await this.model.countDocuments(query).lean().exec();
  }

  async updateOne(findQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return this.model.updateOne(findQuery, updateQuery).exec();
  }

  async updateMany(findQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return this.model.updateMany(findQuery, updateQuery).exec();
  }

  async findOneAndUpdate(
    findQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    options?: QueryOptions,
    populate: any_object = {},
  ) {
    return this.model
      .findOneAndUpdate(findQuery, updateQuery, {
        ...options,
        new: true,
        ...populate,
      })
      .lean()
      .exec();
  }

  async deleteOne(query: FilterQuery<T>) {
    return await this.model.deleteOne(query).exec();
  }

  async deleteMany(query: FilterQuery<T>) {
    return await this.model.deleteMany(query).exec();
  }

  async distinct(key: string, query: FilterQuery<T>) {
    return await this.model.distinct(key, query).exec();
  }
  async findOneAndDelete(query: FilterQuery<T>) {
    return await this.model.findOneAndDelete(query).exec();
  }

  async aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline).exec();
  }
}

export default BaseRepo;
