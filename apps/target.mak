SUBDIRS := hello_world \
	test

SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(abspath $(addprefix $(SELF_DIR),$(addsuffix /target.mak,$(SUBDIRS))))
SELF_DIR := $(abspath $(SELF_DIR)/..)/
