import { Model, DataTypes } from "sequelize";

export class Topics extends Model {
	public id!: number;
	public name!: string;
	public description!: string;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;
}

export const topicsRows = {
	id: {
		autoIncrement: true,
		primaryKey: true,
		type: DataTypes.BIGINT,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		allowNull: false
	}
};

export const topicsOpts = {
	timestamps: false,
	tableName: "topics"
};
