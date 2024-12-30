package main

import "math/rand"

var Colors [8]string = [8]string{
	"red",
	"orange",
	"yellow",
	"green",
	"cyan",
	"blue",
	"purple",
	"pink",
}

func GetRandomColor() string {
	return Colors[rand.Intn(len(Colors))]
}