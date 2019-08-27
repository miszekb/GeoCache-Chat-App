import { prop as DBProp, Typegoose } from "typegoose";
import { ObjectType as GQLObject, Field as GQLField, ID } from "type-graphql";
import { ObjectId } from "mongodb";
import { Role } from "./enums";

@GQLObject()
export class Profile {
  @DBProp({ required: true })
  @GQLField()
  firstName: string;

  @DBProp({ required: true })
  @GQLField()
  lastName: string;

  @DBProp({ required: true, default: "http://s3.amazonaws.com/37assets/svn/765-default-avatar.png" })
  @GQLField()
  profilePicture: string;
}

@GQLObject()
export class Property {
  @DBProp({ required: true })
  @GQLField()
  address: string;

  @DBProp({ required: true })
  @GQLField()
  placeId: string;

  @DBProp({ required: true })
  @GQLField()
  rentAmount: number;
}

@GQLObject()
export class User extends Typegoose {
  @GQLField(type => ID)
  readonly _id: ObjectId;

  @DBProp()
  @GQLField(type => Profile)
  profile: Profile;

  @DBProp()
  @GQLField(type => Property, { nullable: true })
  properties?: Property[];

  @DBProp({ required: true, enum: Role })
  @GQLField(type => Role)
  roles: Role[];

  @DBProp()
  @GQLField(() => Date)
  createdAt: Date;

  @DBProp()
  @GQLField(() => Date)
  updatedAt: Date;

  @DBProp({ required: false,  default: false})
  @GQLField(() => Boolean, {nullable: true})
  isCompany: boolean;
  
  //TODO: Remember to remove required and nullable properties
  @DBProp({default: 0, required: false})
  @GQLField(() => Number, {nullable: true})
  cachesFound: number;
}

export default new User().getModelForClass(User, {
  schemaOptions: { timestamps: true }
});
